using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Queries;

public sealed class EfRoomLookup : IRoomLookup
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfRoomLookup> _logger;

    public EfRoomLookup(DirectoryDbContext db, ILogger<EfRoomLookup> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<RoomRef>> FindByCodeAsync(string code, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code))
                return Result<RoomRef>.Failure(Errors.Validation.Failed("Room code is required."));

            var normalized = code.Trim();

            var room = await _db.Rooms.AsNoTracking()
                .Where(x => x.Code == normalized)
                .Select(x => new RoomRef(
                    x.Id,
                    x.Code,
                    x.Name,
                    x.ZoneId,
                    x.IsActive))
                .FirstOrDefaultAsync(ct);

            return room is null
                ? Result<RoomRef>.Failure(new Error("room.not_found", "Room not found."))
                : Result<RoomRef>.Success(room);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to resolve room by code");
            return Result<RoomRef>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}