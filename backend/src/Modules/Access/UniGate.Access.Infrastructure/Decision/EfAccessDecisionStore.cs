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

    public async Task<Result<bool>> HasActiveRuleAsync(Guid zoneId, Guid groupId, CancellationToken ct)
    {
        try
        {
            var ok = await _db.Rules.AsNoTracking()
                .AnyAsync(r => r.ZoneId == zoneId && r.GroupId == groupId && r.IsActive, ct);

            return Result<bool>.Success(ok);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check rules");
            return Result<bool>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}