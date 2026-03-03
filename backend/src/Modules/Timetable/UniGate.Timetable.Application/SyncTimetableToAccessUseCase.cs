using UniGate.SharedKernel.Access;
using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application;

public sealed class SyncTimetableToAccessUseCase
{
    private readonly ITimetableStore _store;
    private readonly IAccessRuleScheduler _scheduler;

    public SyncTimetableToAccessUseCase(ITimetableStore store, IAccessRuleScheduler scheduler)
    {
        _store = store;
        _scheduler = scheduler;
    }

    public async Task<Result<int>> ExecuteAsync(CancellationToken ct = default)
    {
        var slotsRes = await _store.ListSlotsAsync(take: 10_000, ct);
        if (!slotsRes.IsSuccess)
            return Result<int>.Failure(slotsRes.Error);

        var slots = slotsRes.Value
            .Where(s => s.DayOfWeekIso is >= 1 and <= 7)
            .ToList();

        var groups = slots
            .GroupBy(s => (s.ZoneId, s.GroupId))
            .ToList();

        var updated = 0;

        foreach (var g in groups)
        {
            var zoneId = g.Key.ZoneId;
            var groupId = g.Key.GroupId;

            var windows = g
                .Select(s => new RuleWindowDto(s.DayOfWeekIso, s.StartTime, s.EndTime))
                .Distinct()
                .OrderBy(w => w.DayOfWeekIso).ThenBy(w => w.StartTime)
                .ToList();

            var validFrom = g.Select(x => x.ValidFrom).Where(x => x is not null).Min();
            var validTo = g.Select(x => x.ValidTo).Where(x => x is not null).Max();

            var ensure = await _scheduler.EnsureRuleAsync(zoneId, groupId, ct);
            if (!ensure.IsSuccess)
                return Result<int>.Failure(ensure.Error);

            var upd = await _scheduler.ReplaceWindowsAsync(
                ensure.Value,
                new RuleScheduleV2(windows, validFrom, validTo),
                ct);

            if (!upd.IsSuccess)
                return Result<int>.Failure(upd.Error);

            updated++;
        }

        return Result<int>.Success(updated);
    }
}