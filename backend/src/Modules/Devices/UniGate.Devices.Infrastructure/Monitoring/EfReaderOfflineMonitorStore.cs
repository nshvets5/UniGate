using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Monitoring;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Outbox;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Monitoring;

public sealed class EfReaderOfflineMonitorStore : IReaderOfflineMonitorStore
{
    private readonly DevicesDbContext _db;
    private readonly ILogger<EfReaderOfflineMonitorStore> _logger;

    public EfReaderOfflineMonitorStore(
        DevicesDbContext db,
        ILogger<EfReaderOfflineMonitorStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<IReadOnlyList<OfflineReaderCandidateDto>>> FindOfflineCandidatesAsync(
        DateTimeOffset offlineBeforeUtc,
        DateTimeOffset alertCooldownBeforeUtc,
        CancellationToken ct = default)
    {
        try
        {
            var items = await _db.ReaderDevices.AsNoTracking()
                .Where(x =>
                    x.IsActive &&
                    (x.LastSeenAt == null || x.LastSeenAt < offlineBeforeUtc) &&
                    (x.LastOfflineAlertAt == null || x.LastOfflineAlertAt < alertCooldownBeforeUtc))
                .OrderBy(x => x.Code)
                .Select(x => new OfflineReaderCandidateDto(
                    x.Id,
                    x.Code,
                    x.Name,
                    x.DoorId,
                    x.LastSeenAt))
                .ToListAsync(ct);

            return Result<IReadOnlyList<OfflineReaderCandidateDto>>.Success(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Find offline reader candidates failed");
            return Result<IReadOnlyList<OfflineReaderCandidateDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> EmitOfflineDetectedAsync(OfflineReaderCandidateDto reader, CancellationToken ct = default)
    {
        try
        {
            var payload = new ReaderOfflineDetectedPayload(
                ReaderId: reader.ReaderId,
                ReaderCode: reader.ReaderCode,
                ReaderName: reader.ReaderName,
                DoorId: reader.DoorId,
                LastSeenAt: reader.LastSeenAt,
                DetectedAt: DateTimeOffset.UtcNow);

            _db.OutboxMessages.Add(new OutboxMessage(
                type: TimetableOutboxTypes.ReaderOfflineDetected,
                payloadJson: JsonSerializer.Serialize(payload),
                correlationId: null,
                traceId: null));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Emit reader offline detected failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> MarkOfflineAlertRaisedAsync(Guid readerId, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.ReaderDevices.FirstOrDefaultAsync(x => x.Id == readerId, ct);
            if (entity is null)
                return Result.Failure(new Error("devices.reader.not_found", "Reader not found."));

            entity.MarkOfflineAlertRaised();
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Mark offline alert raised failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}