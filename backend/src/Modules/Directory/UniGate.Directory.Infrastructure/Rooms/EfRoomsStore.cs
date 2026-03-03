using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Directory.Application.Rooms;
using UniGate.Directory.Domain;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Rooms;

public sealed class EfRoomsStore : IRoomsStore
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfRoomsStore> _logger;

    public EfRoomsStore(DirectoryDbContext db, ILogger<EfRoomsStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> CreateAsync(CreateRoomCommand cmd, CancellationToken ct)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(cmd.Code) || string.IsNullOrWhiteSpace(cmd.Name) || cmd.ZoneId == Guid.Empty)
                return Result<Guid>.Failure(Errors.Validation.Failed("Code, Name and ZoneId are required."));

            var code = cmd.Code.Trim();
            var exists = await _db.Rooms.AsNoTracking().AnyAsync(x => x.Code == code, ct);
            if (exists)
                return Result<Guid>.Failure(new Error("room.duplicate_code", "Room code already exists."));

            var room = new Room(code, cmd.Name.Trim(), cmd.ZoneId);
            _db.Rooms.Add(room);
            await _db.SaveChangesAsync(ct);

            return Result<Guid>.Success(room.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create room failed");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PagedResult<RoomDto>>> ListAsync(string? search, int page, int pageSize, CancellationToken ct)
    {
        try
        {
            var q = _db.Rooms.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(x => x.Code.Contains(s) || x.Name.Contains(s));
            }

            q = q.OrderBy(x => x.Code);

            var total = await q.LongCountAsync(ct);
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
                .Select(x => new RoomDto(x.Id, x.Code, x.Name, x.ZoneId, x.IsActive, x.CreatedAt))
                .ToListAsync(ct);

            return Result<PagedResult<RoomDto>>.Success(new PagedResult<RoomDto>(items, page, pageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "List rooms failed");
            return Result<PagedResult<RoomDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<RoomDto>> GetAsync(Guid id, CancellationToken ct)
    {
        try
        {
            var room = await _db.Rooms.AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new RoomDto(x.Id, x.Code, x.Name, x.ZoneId, x.IsActive, x.CreatedAt))
                .FirstOrDefaultAsync(ct);

            return room is null
                ? Result<RoomDto>.Failure(new Error("room.not_found", "Room not found."))
                : Result<RoomDto>.Success(room);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get room failed");
            return Result<RoomDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<RoomDto>> GetByCodeAsync(string code, CancellationToken ct)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code))
                return Result<RoomDto>.Failure(Errors.Validation.Failed("Code is required."));

            var c = code.Trim();

            var room = await _db.Rooms.AsNoTracking()
                .Where(x => x.Code == c)
                .Select(x => new RoomDto(x.Id, x.Code, x.Name, x.ZoneId, x.IsActive, x.CreatedAt))
                .FirstOrDefaultAsync(ct);

            return room is null
                ? Result<RoomDto>.Failure(new Error("room.not_found", "Room not found."))
                : Result<RoomDto>.Success(room);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get room by code failed");
            return Result<RoomDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> UpdateAsync(UpdateRoomCommand cmd, CancellationToken ct)
    {
        try
        {
            if (cmd.Id == Guid.Empty || string.IsNullOrWhiteSpace(cmd.Code) || string.IsNullOrWhiteSpace(cmd.Name) || cmd.ZoneId == Guid.Empty)
                return Result.Failure(Errors.Validation.Failed("Id, Code, Name and ZoneId are required."));

            var room = await _db.Rooms.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (room is null)
                return Result.Failure(new Error("room.not_found", "Room not found."));

            var newCode = cmd.Code.Trim();
            if (!string.Equals(room.Code, newCode, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _db.Rooms.AsNoTracking().AnyAsync(x => x.Code == newCode && x.Id != cmd.Id, ct);
                if (exists)
                    return Result.Failure(new Error("room.duplicate_code", "Room code already exists."));

                room.ChangeCode(newCode);
            }

            room.Rename(cmd.Name.Trim());
            if (room.ZoneId != cmd.ZoneId)
                room.ChangeZone(cmd.ZoneId);

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Update room failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> SetActiveAsync(Guid id, bool isActive, CancellationToken ct)
    {
        try
        {
            if (id == Guid.Empty)
                return Result.Failure(Errors.Validation.Failed("Id is required."));

            var room = await _db.Rooms.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (room is null)
                return Result.Failure(new Error("room.not_found", "Room not found."));

            room.SetActive(isActive);
            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Set room active failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}