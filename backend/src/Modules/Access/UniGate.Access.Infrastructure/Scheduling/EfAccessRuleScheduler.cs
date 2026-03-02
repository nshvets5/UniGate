using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Access.Domain;
using UniGate.Access.Infrastructure.Persistence;
using UniGate.SharedKernel.Access;
using UniGate.SharedKernel.Outbox;
using UniGate.SharedKernel.Results;

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
                payloadJson: System.Text.Json.JsonSerializer.Serialize(new
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

    public async Task<Result> UpdateScheduleAsync(Guid ruleId, RuleSchedule schedule, CancellationToken ct = default)
    {
        try
        {
            var r = await _db.Rules.FirstOrDefaultAsync(x => x.Id == ruleId, ct);
            if (r is null)
                return Result.Failure(new Error("rule.not_found", "Rule not found."));

            try
            {
                r.SetSchedule(schedule.DaysMask, schedule.StartTime, schedule.EndTime, schedule.ValidFrom, schedule.ValidTo);
                r.SetActive(true);
            }
            catch (InvalidOperationException ex)
            {
                return Result.Failure(new Error("rule.schedule_invalid", ex.Message));
            }

            _db.OutboxMessages.Add(new OutboxMessage(
                type: AccessOutboxTypes.RuleUpdatedSchedule,
                payloadJson: System.Text.Json.JsonSerializer.Serialize(new
                {
                    ruleId = r.Id,
                    r.ZoneId,
                    r.GroupId,
                    r.IsActive,
                    r.DaysMask,
                    r.StartTime,
                    r.EndTime,
                    r.ValidFrom,
                    r.ValidTo,
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
            _logger.LogError(ex, "UpdateScheduleAsync failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}