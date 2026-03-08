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
            var oldExists = await _db.ImportBatches.AsNoTracking()
                .AnyAsync(x => x.Id == oldBatchId, ct);

            if (!oldExists)
                return Result<TimetableBatchDiffDto>.Failure(
                    new Error("timetable.batch_not_found", "Old batch not found."));

            var newExists = await _db.ImportBatches.AsNoTracking()
                .AnyAsync(x => x.Id == newBatchId, ct);

            if (!newExists)
                return Result<TimetableBatchDiffDto>.Failure(
                    new Error("timetable.batch_not_found", "New batch not found."));

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

            var diff = TimetableDiffCalculator.Calculate(
                oldBatchId: oldBatchId,
                newBatchId: newBatchId,
                oldSlots: oldSlots,
                newSlots: newSlots);

            return Result<TimetableBatchDiffDto>.Success(diff);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to diff timetable batches {OldBatchId} vs {NewBatchId}", oldBatchId, newBatchId);
            return Result<TimetableBatchDiffDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}