using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application;
using UniGate.Timetable.Application.Diff;
using UniGate.Timetable.Infrastructure.Persistence;

namespace UniGate.Timetable.Infrastructure.Queries;

public sealed class EfTimetablePreviewDiffService : ITimetablePreviewDiffService
{
    private readonly TimetableDbContext _db;
    private readonly ILogger<EfTimetablePreviewDiffService> _logger;

    public EfTimetablePreviewDiffService(TimetableDbContext db, ILogger<EfTimetablePreviewDiffService> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<TimetableBatchDiffDto?>> DiffAgainstActiveAsync(
        IReadOnlyList<ImportSlotRow> incomingRows,
        CancellationToken ct = default)
    {
        try
        {
            var activeBatch = await _db.ImportBatches.AsNoTracking()
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new { x.Id })
                .FirstOrDefaultAsync(ct);

            if (activeBatch is null)
                return Result<TimetableBatchDiffDto?>.Success(null);

            var oldSlots = await _db.Slots.AsNoTracking()
                .Where(x => x.BatchId == activeBatch.Id)
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

            var newSlots = incomingRows
                .Select(x => new TimetableSlotSnapshotDto(
                    x.GroupId,
                    x.ZoneId,
                    x.DayOfWeekIso,
                    x.StartTime,
                    x.EndTime,
                    x.ValidFrom,
                    x.ValidTo,
                    x.Title))
                .ToList();

            var diff = TimetableDiffCalculator.Calculate(
                oldBatchId: activeBatch.Id,
                newBatchId: Guid.Empty,
                oldSlots: oldSlots,
                newSlots: newSlots);

            return Result<TimetableBatchDiffDto?>.Success(diff);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to build preview diff");
            return Result<TimetableBatchDiffDto?>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}