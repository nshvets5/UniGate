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

    public async Task<Result<int>> ReplaceAllSlotsAsync(IReadOnlyList<ImportSlotRow> rows, CancellationToken ct = default)
    {
        try
        {
            var existing = await _db.Slots.ToListAsync(ct);
            _db.Slots.RemoveRange(existing);

            foreach (var r in rows)
            {
                var slot = new TimetableSlot(
                    r.GroupId, r.ZoneId, r.DayOfWeekIso,
                    r.StartTime, r.EndTime, r.ValidFrom, r.ValidTo, r.Title);

                _db.Slots.Add(slot);
            }

            var count = await _db.SaveChangesAsync(ct);
            return Result<int>.Success(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ReplaceAllSlotsAsync failed");
            return Result<int>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<IReadOnlyList<ImportSlotRow>>> ListSlotsAsync(int take, CancellationToken ct = default)
    {
        try
        {
            var items = await _db.Slots.AsNoTracking()
                .Where(x => x.IsActive)
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
            _logger.LogError(ex, "ListSlotsAsync failed");
            return Result<IReadOnlyList<ImportSlotRow>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}