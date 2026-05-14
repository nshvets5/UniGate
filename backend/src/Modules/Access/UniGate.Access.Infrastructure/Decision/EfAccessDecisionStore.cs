using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Access.Application.Decision;
using UniGate.Access.Infrastructure.Persistence;
using UniGate.SharedKernel.Access;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Infrastructure.Decision;

public sealed class EfAccessDecisionStore : IAccessDecisionStore
{
    private readonly AccessDbContext _db;
    private readonly IStudentGroupLookup _studentGroups;
    private readonly ILogger<EfAccessDecisionStore> _logger;

    public EfAccessDecisionStore(
        AccessDbContext db,
        IStudentGroupLookup studentGroups,
        ILogger<EfAccessDecisionStore> logger)
    {
        _db = db;
        _studentGroups = studentGroups;
        _logger = logger;
    }

    public async Task<Result<AccessDecisionDto>> CheckAsync(
        Guid studentId,
        Guid doorId,
        DateTimeOffset nowUtc,
        CancellationToken ct = default)
    {
        try
        {
            var groupRes = await _studentGroups.GetGroupIdByStudentIdAsync(studentId, ct);
            if (!groupRes.IsSuccess)
                return Result<AccessDecisionDto>.Failure(groupRes.Error);

            var groupId = groupRes.Value;

            var door = await _db.Doors.AsNoTracking()
                .Where(d => d.Id == doorId)
                .Join(
                    _db.Zones.AsNoTracking(),
                    d => d.ZoneId,
                    z => z.Id,
                    (d, z) => new
                    {
                        DoorId = d.Id,
                        d.ZoneId,
                        d.RoomId,
                        DoorActive = d.IsActive,
                        ZoneActive = z.IsActive
                    })
                .FirstOrDefaultAsync(ct);

            if (door is null)
            {
                return Result<AccessDecisionDto>.Success(new AccessDecisionDto(
                    Allowed: false,
                    Reason: "DOOR_NOT_FOUND",
                    DoorId: doorId,
                    ZoneId: null,
                    RoomId: null,
                    StudentId: studentId,
                    GroupId: groupId,
                    MatchedRuleId: null,
                    MatchedTargetType: null,
                    MatchedTargetId: null));
            }

            if (!door.DoorActive)
            {
                return Result<AccessDecisionDto>.Success(new AccessDecisionDto(
                    Allowed: false,
                    Reason: "DOOR_INACTIVE",
                    DoorId: doorId,
                    ZoneId: door.ZoneId,
                    RoomId: door.RoomId,
                    StudentId: studentId,
                    GroupId: groupId,
                    MatchedRuleId: null,
                    MatchedTargetType: null,
                    MatchedTargetId: null));
            }

            if (!door.ZoneActive)
            {
                return Result<AccessDecisionDto>.Success(new AccessDecisionDto(
                    Allowed: false,
                    Reason: "ZONE_INACTIVE",
                    DoorId: doorId,
                    ZoneId: door.ZoneId,
                    RoomId: door.RoomId,
                    StudentId: studentId,
                    GroupId: groupId,
                    MatchedRuleId: null,
                    MatchedTargetType: null,
                    MatchedTargetId: null));
            }

            var local = ToLocalRome(nowUtc);
            var dayIso = ToIsoDay(local.DayOfWeek);
            var time = TimeOnly.FromDateTime(local.DateTime);

            var candidateTargets = new List<(AccessTargetType Type, Guid Id)>
            {
                (AccessTargetType.Door, door.DoorId)
            };

            if (door.RoomId is not null)
                candidateTargets.Add((AccessTargetType.Room, door.RoomId.Value));

            candidateTargets.Add((AccessTargetType.Zone, door.ZoneId));

            var targetTypes = candidateTargets.Select(x => x.Type).ToArray();
            var targetIds = candidateTargets.Select(x => x.Id).ToArray();

            var candidateRules = await _db.Rules.AsNoTracking()
                .Where(r =>
                    r.GroupId == groupId &&
                    r.IsActive &&
                    targetTypes.Contains(r.TargetType) &&
                    targetIds.Contains(r.TargetId) &&
                    (r.ValidFrom == null || r.ValidFrom <= nowUtc) &&
                    (r.ValidTo == null || r.ValidTo >= nowUtc))
                .Select(r => new
                {
                    r.Id,
                    r.TargetType,
                    r.TargetId,
                    Priority =
                        r.TargetType == AccessTargetType.Door ? 1 :
                        r.TargetType == AccessTargetType.Room ? 2 :
                        3
                })
                .OrderBy(x => x.Priority)
                .ToListAsync(ct);

            foreach (var rule in candidateRules)
            {
                var windows = await _db.RuleWindows.AsNoTracking()
                    .Where(w =>
                        w.RuleId == rule.Id &&
                        w.IsActive &&
                        w.DayOfWeekIso == dayIso)
                    .ToListAsync(ct);

                if (windows.Count == 0)
                    continue;

                var windowMatches = windows.Any(w =>
                {
                    if (w.EndTime >= w.StartTime)
                        return time >= w.StartTime && time <= w.EndTime;

                    return time >= w.StartTime || time <= w.EndTime;
                });

                if (!windowMatches)
                    continue;

                return Result<AccessDecisionDto>.Success(new AccessDecisionDto(
                    Allowed: true,
                    Reason: "RULE_MATCH",
                    DoorId: doorId,
                    ZoneId: door.ZoneId,
                    RoomId: door.RoomId,
                    StudentId: studentId,
                    GroupId: groupId,
                    MatchedRuleId: rule.Id,
                    MatchedTargetType: rule.TargetType,
                    MatchedTargetId: rule.TargetId));
            }

            return Result<AccessDecisionDto>.Success(new AccessDecisionDto(
                Allowed: false,
                Reason: "NO_RULE",
                DoorId: doorId,
                ZoneId: door.ZoneId,
                RoomId: door.RoomId,
                StudentId: studentId,
                GroupId: groupId,
                MatchedRuleId: null,
                MatchedTargetType: null,
                MatchedTargetId: null));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to evaluate access decision");
            return Result<AccessDecisionDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    private static DateTimeOffset ToLocalRome(DateTimeOffset utc)
    {
        try
        {
            var tz = TimeZoneInfo.FindSystemTimeZoneById("Europe/Rome");
            return TimeZoneInfo.ConvertTime(utc, tz);
        }
        catch
        {
            return utc;
        }
    }

    private static int ToIsoDay(DayOfWeek day) => day switch
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
}