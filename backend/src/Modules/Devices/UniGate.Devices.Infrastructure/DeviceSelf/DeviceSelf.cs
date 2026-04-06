using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Attempts;
using UniGate.Devices.Application.DeviceSelf;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.DeviceSelf;

public sealed class EfDeviceSelfStore : IDeviceSelfStore
{
    private readonly DevicesDbContext _db;
    private readonly ILogger<EfDeviceSelfStore> _logger;

    public EfDeviceSelfStore(DevicesDbContext db, ILogger<EfDeviceSelfStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<DeviceSelfDto>> GetSelfAsync(Guid readerId, CancellationToken ct = default)
    {
        try
        {
            var item = await _db.ReaderDevices.AsNoTracking()
                .Where(x => x.Id == readerId)
                .Select(x => new DeviceSelfDto(
                    x.Id,
                    x.Code,
                    x.Name,
                    x.DoorId,
                    x.Type,
                    x.IsActive,
                    x.LastSeenAt))
                .FirstOrDefaultAsync(ct);

            return item is null
                ? Result<DeviceSelfDto>.Failure(new Error("devices.reader.not_found", "Reader not found."))
                : Result<DeviceSelfDto>.Success(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get device self failed");
            return Result<DeviceSelfDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> HeartbeatAsync(Guid readerId, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.ReaderDevices.FirstOrDefaultAsync(x => x.Id == readerId, ct);
            if (entity is null)
                return Result.Failure(new Error("devices.reader.not_found", "Reader not found."));

            entity.Touch();
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Device heartbeat failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PagedResult<ReaderScanAttemptDto>>> ListOwnAttemptsAsync(
        Guid readerId,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        try
        {
            var q = _db.ReaderScanAttempts.AsNoTracking()
                .Where(x => x.ReaderId == readerId)
                .OrderByDescending(x => x.OccurredAt);

            var total = await q.LongCountAsync(ct);

            var items = await q
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ReaderScanAttemptDto(
                    x.Id,
                    x.ReaderId,
                    x.CredentialType,
                    x.CredentialValue,
                    x.CredentialId,
                    x.StudentId,
                    x.IsAllowed,
                    x.ReasonCode,
                    x.OccurredAt))
                .ToListAsync(ct);

            return Result<PagedResult<ReaderScanAttemptDto>>.Success(
                new PagedResult<ReaderScanAttemptDto>(items, page, pageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "List own attempts failed");
            return Result<PagedResult<ReaderScanAttemptDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<DeviceDashboardDto>> GetDashboardAsync(
        Guid readerId,
        int recentTake,
        CancellationToken ct = default)
    {
        try
        {
            var device = await _db.ReaderDevices.AsNoTracking()
                .Where(x => x.Id == readerId)
                .Select(x => new DeviceSelfDto(
                    x.Id,
                    x.Code,
                    x.Name,
                    x.DoorId,
                    x.Type,
                    x.IsActive,
                    x.LastSeenAt))
                .FirstOrDefaultAsync(ct);

            if (device is null)
                return Result<DeviceDashboardDto>.Failure(
                    new Error("devices.reader.not_found", "Reader not found."));

            var attemptsBase = _db.ReaderScanAttempts.AsNoTracking()
                .Where(x => x.ReaderId == readerId);

            var totalAttempts = await attemptsBase.CountAsync(ct);
            var allowedAttempts = await attemptsBase.CountAsync(x => x.IsAllowed, ct);
            var deniedAttempts = totalAttempts - allowedAttempts;

            var recentAttempts = await attemptsBase
                .OrderByDescending(x => x.OccurredAt)
                .Take(recentTake)
                .Select(x => new ReaderScanAttemptDto(
                    x.Id,
                    x.ReaderId,
                    x.CredentialType,
                    x.CredentialValue,
                    x.CredentialId,
                    x.StudentId,
                    x.IsAllowed,
                    x.ReasonCode,
                    x.OccurredAt))
                .ToListAsync(ct);

            var dto = new DeviceDashboardDto(
                Device: device,
                Counters: new DeviceDashboardCountersDto(
                    TotalAttempts: totalAttempts,
                    AllowedAttempts: allowedAttempts,
                    DeniedAttempts: deniedAttempts),
                RecentAttempts: recentAttempts);

            return Result<DeviceDashboardDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Get device dashboard failed");
            return Result<DeviceDashboardDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}