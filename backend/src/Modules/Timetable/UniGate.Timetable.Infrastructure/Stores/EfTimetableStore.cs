using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application;
using UniGate.Timetable.Domain;
using UniGate.Timetable.Infrastructure.Persistence;

namespace UniGate.Timetable.Infrastructure.Stores;

public sealed class EfTimetableStore : ITimetableStore
{
    private readonly TimetableDbContext _db;
    private readonly ILogger<EfTimetableStore> _logger;

    public EfTimetableStore(TimetableDbContext db, ILogger<EfTimetableStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> ImportBatchAsync(
        string sourceType,
        string? sourceFileName,
        string? importedByProvider,
        string? importedBySubject,
        IReadOnlyList<ImportSlotRow> rows,
        int totalRows,
        int skippedRows,
        CancellationToken ct = default)
    {
        try
        {
            var batch = new TimetableImportBatch(
                sourceType,
                sourceFileName,
                importedByProvider,
                importedBySubject,
                totalRows,
                rows.Count,
                skippedRows);

            var activeBatches = await _db.ImportBatches.Where(x => x.IsActive).ToListAsync(ct);
            foreach (var b in activeBatches)
                b.Deactivate();

            batch.Activate();
            _db.ImportBatches.Add(batch);

            foreach (var r in rows)
            {
                _db.Slots.Add(new TimetableSlot(
                    batch.Id,
                    r.GroupId,
                    r.ZoneId,
                    r.DayOfWeekIso,
                    r.StartTime,
                    r.EndTime,
                    r.ValidFrom,
                    r.ValidTo,
                    r.Title));
            }

            await _db.SaveChangesAsync(ct);
            return Result<Guid>.Success(batch.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ImportBatchAsync failed");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<IReadOnlyList<ImportSlotRow>>> ListActiveSlotsAsync(int take, CancellationToken ct = default)
    {
        try
        {
            var activeBatchId = await _db.ImportBatches.AsNoTracking()
                .Where(x => x.IsActive)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => (Guid?)x.Id)
                .FirstOrDefaultAsync(ct);

            if (activeBatchId is null)
                return Result<IReadOnlyList<ImportSlotRow>>.Success(Array.Empty<ImportSlotRow>());

            var items = await _db.Slots.AsNoTracking()
                .Where(x => x.BatchId == activeBatchId.Value && x.IsActive)
                .OrderByDescending(x => x.CreatedAt)
                .Take(take)
                .Select(x => new ImportSlotRow(
                    x.GroupId, x.ZoneId, x.DayOfWeekIso,
                    x.StartTime, x.EndTime, x.ValidFrom, x.ValidTo, x.Title))
                .ToListAsync(ct);

            return Result<IReadOnlyList<ImportSlotRow>>.Success(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ListActiveSlotsAsync failed");
            return Result<IReadOnlyList<ImportSlotRow>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<IReadOnlyList<TimetableImportBatchDto>>> ListBatchesAsync(int take, CancellationToken ct = default)
    {
        try
        {
            var items = await _db.ImportBatches.AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .Take(take)
                .Select(x => new TimetableImportBatchDto(
                    x.Id,
                    x.SourceType,
                    x.SourceFileName,
                    x.ImportedByProvider,
                    x.ImportedBySubject,
                    x.TotalRows,
                    x.ImportedRows,
                    x.SkippedRows,
                    x.IsActive,
                    x.CreatedAt))
                .ToListAsync(ct);

            return Result<IReadOnlyList<TimetableImportBatchDto>>.Success(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ListBatchesAsync failed");
            return Result<IReadOnlyList<TimetableImportBatchDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> ActivateBatchAsync(Guid batchId, CancellationToken ct = default)
    {
        try
        {
            var target = await _db.ImportBatches.FirstOrDefaultAsync(x => x.Id == batchId, ct);
            if (target is null)
                return Result.Failure(new Error("timetable.batch_not_found", "Import batch not found."));

            var activeBatches = await _db.ImportBatches.Where(x => x.IsActive).ToListAsync(ct);
            foreach (var b in activeBatches)
                b.Deactivate();

            target.Activate();

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ActivateBatchAsync failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}