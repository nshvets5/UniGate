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

            var comparer = new TimetableSlotSnapshotComparer();

            var oldSet = oldSlots.ToHashSet(comparer);
            var newSet = newSlots.ToHashSet(comparer);

            var added = newSet.Except(oldSet, comparer).OrderBy(SortKey).ToList();
            var removed = oldSet.Except(newSet, comparer).OrderBy(SortKey).ToList();
            var unchanged = newSet.Intersect(oldSet, comparer).OrderBy(SortKey).ToList();

            return Result<TimetableBatchDiffDto>.Success(
                new TimetableBatchDiffDto(
                    oldBatchId,
                    newBatchId,
                    added.Count,
                    removed.Count,
                    unchanged.Count,
                    added,
                    removed,
                    unchanged));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to diff timetable batches {OldBatchId} vs {NewBatchId}", oldBatchId, newBatchId);
            return Result<TimetableBatchDiffDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    private static string SortKey(TimetableSlotSnapshotDto x)
        => $"{x.GroupId:N}|{x.ZoneId:N}|{x.DayOfWeekIso}|{x.StartTime}|{x.EndTime}|{x.ValidFrom}|{x.ValidTo}|{x.Title}";

    private sealed class TimetableSlotSnapshotComparer : IEqualityComparer<TimetableSlotSnapshotDto>
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
                   && string.Equals(Norm(x.Title), Norm(y.Title), StringComparison.Ordinal);
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

        private static string Norm(string? s) => (s ?? string.Empty).Trim();
    }
}