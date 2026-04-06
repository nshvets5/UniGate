using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Readers;
using UniGate.Devices.Domain;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Stores;

public sealed class EfReaderDevicesStore : IReaderDevicesStore
{
    private readonly DevicesDbContext _db;
    private readonly ILogger<EfReaderDevicesStore> _logger;

    public EfReaderDevicesStore(DevicesDbContext db, ILogger<EfReaderDevicesStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<ReaderDeviceCreatedDto>> CreateAsync(CreateReaderDeviceCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var code = cmd.Code.Trim();

            var exists = await _db.ReaderDevices.AsNoTracking()
                .AnyAsync(x => x.Code == code, ct);

            if (exists)
                return Result<ReaderDeviceCreatedDto>.Failure(
                    new Error("devices.reader.duplicate_code", "Reader code already exists."));

            var reader = new ReaderDevice(code, cmd.Name.Trim(), cmd.DoorId, cmd.Type);

            var apiKey = GenerateApiKey();
            reader.SetApiKeyHash(Hash(apiKey));

            _db.ReaderDevices.Add(reader);
            await _db.SaveChangesAsync(ct);

            return Result<ReaderDeviceCreatedDto>.Success(
                new ReaderDeviceCreatedDto(reader.Id, reader.Code, apiKey));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create reader device failed");
            return Result<ReaderDeviceCreatedDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PagedResult<ReaderDeviceDto>>> ListAsync(string? search, int page, int pageSize, CancellationToken ct = default)
    {
        try
        {
            var q = _db.ReaderDevices.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(x => x.Code.Contains(s) || x.Name.Contains(s));
            }

            q = q.OrderBy(x => x.Code);

            var total = await q.LongCountAsync(ct);
            var items = await q.Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ReaderDeviceDto(
                    x.Id,
                    x.Code,
                    x.Name,
                    x.DoorId,
                    x.Type,
                    x.IsActive,
                    x.CreatedAt,
                    x.LastSeenAt))
                .ToListAsync(ct);

            return Result<PagedResult<ReaderDeviceDto>>.Success(
                new PagedResult<ReaderDeviceDto>(items, page, pageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "List reader devices failed");
            return Result<PagedResult<ReaderDeviceDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<ReaderDeviceDto>> GetAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var item = await _db.ReaderDevices.AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new ReaderDeviceDto(
                    x.Id,
                    x.Code,
                    x.Name,
                    x.DoorId,
                    x.Type,
                    x.IsActive,
                    x.CreatedAt,
                    x.LastSeenAt))
                .FirstOrDefaultAsync(ct);

            return item is null
                ? Result<ReaderDeviceDto>.Failure(new Error("devices.reader.not_found", "Reader device not found."))
                : Result<ReaderDeviceDto>.Success(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get reader device failed");
            return Result<ReaderDeviceDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<ReaderDeviceDto>> GetByCodeAsync(string code, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(code))
                return Result<ReaderDeviceDto>.Failure(Errors.Validation.Failed("Code is required."));

            var normalized = code.Trim();

            var item = await _db.ReaderDevices.AsNoTracking()
                .Where(x => x.Code == normalized)
                .Select(x => new ReaderDeviceDto(
                    x.Id,
                    x.Code,
                    x.Name,
                    x.DoorId,
                    x.Type,
                    x.IsActive,
                    x.CreatedAt,
                    x.LastSeenAt))
                .FirstOrDefaultAsync(ct);

            return item is null
                ? Result<ReaderDeviceDto>.Failure(new Error("devices.reader.not_found", "Reader device not found."))
                : Result<ReaderDeviceDto>.Success(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get reader device by code failed");
            return Result<ReaderDeviceDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<ReaderDeviceStatusDto>> GetStatusAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var item = await _db.ReaderDevices.AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new
                {
                    x.Id,
                    x.Code,
                    x.Name,
                    x.DoorId,
                    x.Type,
                    x.IsActive,
                    x.ApiKeyHash,
                    x.CreatedAt,
                    x.LastSeenAt
                })
                .FirstOrDefaultAsync(ct);

            if (item is null)
                return Result<ReaderDeviceStatusDto>.Failure(
                    new Error("devices.reader.not_found", "Reader device not found."));

            var now = DateTimeOffset.UtcNow;
            var isOnline = item.LastSeenAt is not null && (now - item.LastSeenAt.Value) <= TimeSpan.FromMinutes(2);

            return Result<ReaderDeviceStatusDto>.Success(
                new ReaderDeviceStatusDto(
                    item.Id,
                    item.Code,
                    item.Name,
                    item.DoorId,
                    item.Type,
                    item.IsActive,
                    !string.IsNullOrWhiteSpace(item.ApiKeyHash),
                    item.CreatedAt,
                    item.LastSeenAt,
                    now,
                    isOnline));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get reader device status failed");
            return Result<ReaderDeviceStatusDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> UpdateAsync(UpdateReaderDeviceCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.ReaderDevices.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (entity is null)
                return Result.Failure(new Error("devices.reader.not_found", "Reader device not found."));

            var newCode = cmd.Code.Trim();

            if (!string.Equals(entity.Code, newCode, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _db.ReaderDevices.AsNoTracking()
                    .AnyAsync(x => x.Code == newCode && x.Id != cmd.Id, ct);

                if (exists)
                    return Result.Failure(new Error("devices.reader.duplicate_code", "Reader code already exists."));

                entity.ChangeCode(newCode);
            }

            entity.Rename(cmd.Name.Trim());

            if (entity.DoorId != cmd.DoorId)
                entity.ChangeDoor(cmd.DoorId);

            if (entity.Type != cmd.Type)
                entity.ChangeType(cmd.Type);

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Update reader device failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> SetActiveAsync(Guid id, bool isActive, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.ReaderDevices.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity is null)
                return Result.Failure(new Error("devices.reader.not_found", "Reader device not found."));

            entity.SetActive(isActive);
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Set reader device active failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> TouchAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.ReaderDevices.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity is null)
                return Result.Failure(new Error("devices.reader.not_found", "Reader device not found."));

            entity.Touch();
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Touch reader device failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<ReaderApiKeyRotatedDto>> RotateApiKeyAsync(Guid id, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.ReaderDevices.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (entity is null)
                return Result<ReaderApiKeyRotatedDto>.Failure(
                    new Error("devices.reader.not_found", "Reader device not found."));

            var apiKey = GenerateApiKey();
            entity.SetApiKeyHash(Hash(apiKey));

            await _db.SaveChangesAsync(ct);

            return Result<ReaderApiKeyRotatedDto>.Success(
                new ReaderApiKeyRotatedDto(entity.Id, entity.Code, apiKey));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Rotate reader api key failed");
            return Result<ReaderApiKeyRotatedDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    private static string GenerateApiKey()
        => Guid.NewGuid().ToString("N") + Guid.NewGuid().ToString("N");

    private static string Hash(string value)
        => Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(value)));
}