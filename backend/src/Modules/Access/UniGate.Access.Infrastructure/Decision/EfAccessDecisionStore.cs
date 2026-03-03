using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Access.Application.Decision;
using UniGate.Access.Infrastructure.Persistence;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Infrastructure.Decision;

public sealed class EfAccessDecisionStore : IAccessDecisionStore
{
    private readonly AccessDbContext _db;
    private readonly ILogger<EfAccessDecisionStore> _logger;

    public EfAccessDecisionStore(AccessDbContext db, ILogger<EfAccessDecisionStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<(Guid ZoneId, bool DoorActive, bool ZoneActive)>> GetDoorZoneAsync(Guid doorId, CancellationToken ct)
    {
        try
        {
            var row = await _db.Doors.AsNoTracking()
                .Where(d => d.Id == doorId)
                .Join(_db.Zones.AsNoTracking(),
                    d => d.ZoneId,
                    z => z.Id,
                    (d, z) => new { d.ZoneId, DoorActive = d.IsActive, ZoneActive = z.IsActive })
                .FirstOrDefaultAsync(ct);

            if (row is null)
                return Result<(Guid, bool, bool)>.Failure(new Error("door.not_found", "Door not found."));

            return Result<(Guid, bool, bool)>.Success((row.ZoneId, row.DoorActive, row.ZoneActive));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get door zone");
            return Result<(Guid, bool, bool)>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<bool>> HasAllowedWindowAsync(Guid zoneId, Guid groupId, DateTimeOffset nowUtc, CancellationToken ct)
    {
        try
        {
            var rule = await _db.Rules.AsNoTracking()
                .Where(r => r.ZoneId == zoneId && r.GroupId == groupId && r.IsActive)
                .Select(r => new { r.Id, r.ValidFrom, r.ValidTo })
                .FirstOrDefaultAsync(ct);

            if (rule is null)
                return Result<bool>.Success(false);

            if (rule.ValidFrom is not null && nowUtc < rule.ValidFrom.Value) return Result<bool>.Success(false);
            if (rule.ValidTo is not null && nowUtc > rule.ValidTo.Value) return Result<bool>.Success(false);

            TimeZoneInfo tz;
            try { tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Rome"); }
            catch { tz = TimeZoneInfo.Utc; }

            var local = TimeZoneInfo.ConvertTime(nowUtc, tz);
            var dayIso = local.DayOfWeek switch
            {
                DayOfWeek.Monday => 1,
                DayOfWeek.Tuesday => 2,
                DayOfWeek.Wednesday => 3,
                DayOfWeek.Thursday => 4,
                DayOfWeek.Friday => 5,
                DayOfWeek.Saturday => 6,
                DayOfWeek.Sunday => 7,
                _ => 0
            };

            var t = TimeOnly.FromDateTime(local.DateTime);

            var windows = await _db.RuleWindows.AsNoTracking()
                .Where(w => w.RuleId == rule.Id && w.IsActive && w.DayOfWeekIso == dayIso)
                .ToListAsync(ct);

            if (windows.Count == 0)
                return Result<bool>.Success(false);

            var ok = windows.Any(w =>
            {
                if (w.EndTime >= w.StartTime)
                    return t >= w.StartTime && t <= w.EndTime;

                return t >= w.StartTime || t <= w.EndTime;
            });

            return Result<bool>.Success(ok);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to evaluate rule windows");
            return Result<bool>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}