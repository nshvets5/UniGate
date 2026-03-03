using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Access.Domain;
using UniGate.Access.Infrastructure.Persistence;
using UniGate.SharedKernel.Access;
using UniGate.SharedKernel.Outbox;
using UniGate.SharedKernel.Results;
using System.Text.Json;

namespace UniGate.Access.Infrastructure.Scheduling;

public sealed class EfAccessRuleScheduler : IAccessRuleScheduler
{
    private readonly AccessDbContext _db;
    private readonly ILogger<EfAccessRuleScheduler> _logger;

    public EfAccessRuleScheduler(AccessDbContext db, ILogger<EfAccessRuleScheduler> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> EnsureRuleAsync(Guid zoneId, Guid groupId, CancellationToken ct = default)
    {
        try
        {
            var existing = await _db.Rules.FirstOrDefaultAsync(r => r.ZoneId == zoneId && r.GroupId == groupId, ct);
            if (existing is not null)
                return Result<Guid>.Success(existing.Id);

            var r = new AccessRule(zoneId, groupId);
            _db.Rules.Add(r);

            _db.OutboxMessages.Add(new OutboxMessage(
                type: AccessOutboxTypes.RuleCreated,
                payloadJson: JsonSerializer.Serialize(new
                {
                    ruleId = r.Id,
                    r.ZoneId,
                    r.GroupId,
                    r.IsActive,
                    occurredAt = DateTimeOffset.UtcNow,
                    actorProvider = "timetable",
                    actorSubject = "sync"
                }),
                correlationId: null,
                traceId: null));

            await _db.SaveChangesAsync(ct);
            return Result<Guid>.Success(r.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "EnsureRuleAsync failed");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> ReplaceWindowsAsync(Guid ruleId, RuleScheduleV2 schedule, CancellationToken ct = default)
    {
        try
        {
            var rule = await _db.Rules.FirstOrDefaultAsync(x => x.Id == ruleId, ct);
            if (rule is null)
                return Result.Failure(new Error("rule.not_found", "Rule not found."));

            try
            {
                rule.SetValidity(schedule.ValidFrom, schedule.ValidTo);
                rule.SetActive(true);
            }
            catch (InvalidOperationException ex)
            {
                return Result.Failure(new Error("rule.validity_invalid", ex.Message));
            }

            var existing = await _db.RuleWindows.Where(w => w.RuleId == ruleId).ToListAsync(ct);
            _db.RuleWindows.RemoveRange(existing);

            foreach (var w in schedule.Windows)
            {
                if (w.DayOfWeekIso is < 1 or > 7)
                    return Result.Failure(Errors.Validation.Failed("DayOfWeekIso must be 1..7."));

                _db.RuleWindows.Add(new RuleWindow(ruleId, w.DayOfWeekIso, w.StartTime, w.EndTime));
            }

            _db.OutboxMessages.Add(new OutboxMessage(
                type: AccessOutboxTypes.RuleUpdatedSchedule,
                payloadJson: JsonSerializer.Serialize(new
                {
                    ruleId = rule.Id,
                    rule.ZoneId,
                    rule.GroupId,
                    rule.IsActive,
                    rule.ValidFrom,
                    rule.ValidTo,
                    windows = schedule.Windows,
                    occurredAt = DateTimeOffset.UtcNow,
                    actorProvider = "timetable",
                    actorSubject = "sync"
                }),
                correlationId: null,
                traceId: null));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ReplaceWindowsAsync failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}