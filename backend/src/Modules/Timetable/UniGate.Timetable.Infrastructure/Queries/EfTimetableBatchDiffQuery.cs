using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Diff;
using UniGate.Timetable.Infrastructure.Persistence;

namespace UniGate.Timetable.Infrastructure.Queries;

public sealed class EfTimetableBatchDiffQuery : ITimetableBatchDiffQuery
{
    private readonly TimetableDbContext _db;
    private readonly ILogger<EfTimetableBatchDiffQuery> _logger;

    public EfTimetableBatchDiffQuery(TimetableDbContext db, ILogger<EfTimetableBatchDiffQuery> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<TimetableBatchDiffDto>> GetDiffAsync(Guid oldBatchId, Guid newBatchId, CancellationToken ct = default)
    {
        try
        {
            var oldExists = await _db.ImportBatches.AsNoTracking().AnyAsync(x => x.Id == oldBatchId, ct);
            if (!oldExists)
                return Result<TimetableBatchDiffDto>.Failure(new Error("timetable.batch_not_found", "Old batch not found."));

            var newExists = await _db.ImportBatches.AsNoTracking().AnyAsync(x => x.Id == newBatchId, ct);
            if (!newExists)
                return Result<TimetableBatchDiffDto>.Failure(new Error("timetable.batch_not_found", "New batch not found."));

            var oldSlots = await _db.Slots.AsNoTracking()
                .Where(x => x.BatchId == oldBatchId)
                .Select(x => new TimetableSlotSnapshotDto(
                    x.GroupId,
                    x.ZoneId,
                    x.DayOfWeekIso,
                    x.StartTime,
                    x.EndTime,
                    x.ValidFrom,
                    x.ValidTo,
                    x.Title))
                .ToListAsync(ct);

            var newSlots = await _db.Slots.AsNoTracking()
                .Where(x => x.BatchId == newBatchId)
                .Select(x => new TimetableSlotSnapshotDto(
                    x.GroupId,
                    x.ZoneId,
                    x.DayOfWeekIso,
                    x.StartTime,
                    x.EndTime,
                    x.ValidFrom,
                    x.ValidTo,
                    x.Title))
                .ToListAsync(ct);

            var exactComparer = new ExactSlotComparer();

            var oldByKey = oldSlots
                .GroupBy(SemanticKey)
                .ToDictionary(g => g.Key, g => g.OrderBy(ExactSortKey).ToList());

            var newByKey = newSlots
                .GroupBy(SemanticKey)
                .ToDictionary(g => g.Key, g => g.OrderBy(ExactSortKey).ToList());

            var allKeys = oldByKey.Keys.Union(newByKey.Keys).OrderBy(x => x).ToList();

            var added = new List<TimetableSlotSnapshotDto>();
            var removed = new List<TimetableSlotSnapshotDto>();
            var changed = new List<TimetableSlotChangedDto>();
            var unchanged = new List<TimetableSlotSnapshotDto>();

            foreach (var key in allKeys)
            {
                oldByKey.TryGetValue(key, out var oldGroup);
                newByKey.TryGetValue(key, out var newGroup);

                oldGroup ??= new List<TimetableSlotSnapshotDto>();
                newGroup ??= new List<TimetableSlotSnapshotDto>();

                var oldRemaining = new List<TimetableSlotSnapshotDto>(oldGroup);
                var newRemaining = new List<TimetableSlotSnapshotDto>(newGroup);

                for (var i = oldRemaining.Count - 1; i >= 0; i--)
                {
                    var oldItem = oldRemaining[i];
                    var idx = newRemaining.FindIndex(n => exactComparer.Equals(oldItem, n));
                    if (idx >= 0)
                    {
                        unchanged.Add(oldItem);
                        oldRemaining.RemoveAt(i);
                        newRemaining.RemoveAt(idx);
                    }
                }

                var pairs = Math.Min(oldRemaining.Count, newRemaining.Count);
                for (var i = 0; i < pairs; i++)
                {
                    changed.Add(new TimetableSlotChangedDto(
                        SemanticKey: key,
                        Old: oldRemaining[i],
                        New: newRemaining[i]));
                }

                if (oldRemaining.Count > pairs)
                    removed.AddRange(oldRemaining.Skip(pairs));

                if (newRemaining.Count > pairs)
                    added.AddRange(newRemaining.Skip(pairs));
            }

            added = added.OrderBy(ExactSortKey).ToList();
            removed = removed.OrderBy(ExactSortKey).ToList();
            changed = changed
                .OrderBy(x => x.SemanticKey)
                .ThenBy(x => ExactSortKey(x.New))
                .ToList();
            unchanged = unchanged.OrderBy(ExactSortKey).ToList();

            return Result<TimetableBatchDiffDto>.Success(
                new TimetableBatchDiffDto(
                    OldBatchId: oldBatchId,
                    NewBatchId: newBatchId,
                    AddedCount: added.Count,
                    RemovedCount: removed.Count,
                    ChangedCount: changed.Count,
                    UnchangedCount: unchanged.Count,
                    Added: added,
                    Removed: removed,
                    Changed: changed,
                    Unchanged: unchanged));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to diff timetable batches {OldBatchId} vs {NewBatchId}", oldBatchId, newBatchId);
            return Result<TimetableBatchDiffDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    private static string SemanticKey(TimetableSlotSnapshotDto x)
        => $"{x.GroupId:N}|{x.DayOfWeekIso}|{Norm(x.Title)}";

    private static string ExactSortKey(TimetableSlotSnapshotDto x)
        => $"{x.GroupId:N}|{x.ZoneId:N}|{x.DayOfWeekIso}|{x.StartTime}|{x.EndTime}|{x.ValidFrom}|{x.ValidTo}|{Norm(x.Title)}";

    private static string Norm(string? s) => (s ?? string.Empty).Trim().ToLowerInvariant();

    private sealed class ExactSlotComparer : IEqualityComparer<TimetableSlotSnapshotDto>
    {
        public bool Equals(TimetableSlotSnapshotDto? x, TimetableSlotSnapshotDto? y)
        {
            if (ReferenceEquals(x, y)) return true;
            if (x is null || y is null) return false;

            return x.GroupId == y.GroupId
                   && x.ZoneId == y.ZoneId
                   && x.DayOfWeekIso == y.DayOfWeekIso
                   && x.StartTime == y.StartTime
                   && x.EndTime == y.EndTime
                   && x.ValidFrom == y.ValidFrom
                   && x.ValidTo == y.ValidTo
                   && Norm(x.Title) == Norm(y.Title);
        }

        public int GetHashCode(TimetableSlotSnapshotDto obj)
        {
            return HashCode.Combine(
                obj.GroupId,
                obj.ZoneId,
                obj.DayOfWeekIso,
                obj.StartTime,
                obj.EndTime,
                obj.ValidFrom,
                obj.ValidTo,
                Norm(obj.Title));
        }
    }
}