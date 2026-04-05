using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using UniGate.Devices.Application.Scan;
using UniGate.Devices.Domain;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.SharedKernel.Integration;
using UniGate.SharedKernel.Outbox;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Scan;

public sealed class EfReaderScanStore : IReaderScanStore
{
    private readonly DevicesDbContext _db;
    private readonly ILogger<EfReaderScanStore> _logger;

    public EfReaderScanStore(DevicesDbContext db, ILogger<EfReaderScanStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<ReaderDoorDto>> GetReaderDoorAsync(Guid readerId, CancellationToken ct = default)
    {
        try
        {
            var item = await _db.ReaderDevices.AsNoTracking()
                .Where(x => x.Id == readerId)
                .Select(x => new ReaderDoorDto(
                    x.Id,
                    x.DoorId,
                    x.IsActive))
                .FirstOrDefaultAsync(ct);

            return item is null
                ? Result<ReaderDoorDto>.Failure(new Error("devices.reader.not_found", "Reader not found."))
                : Result<ReaderDoorDto>.Success(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetReaderDoorAsync failed");
            return Result<ReaderDoorDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> LogAttemptAsync(ReaderScanLogEntry entry, CancellationToken ct = default)
    {
        try
        {
            _db.ReaderScanAttempts.Add(new ReaderScanAttempt(
                entry.ReaderId,
                entry.CredentialType,
                entry.CredentialValue,
                entry.CredentialId,
                entry.StudentId,
                entry.IsAllowed,
                entry.ReasonCode));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LogAttemptAsync failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> TouchReaderAsync(Guid readerId, CancellationToken ct = default)
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
            _logger.LogError(ex, "TouchReaderAsync failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> EmitSuspiciousAccessAlertAsync(ReaderSuspiciousAccessAlertEntry entry, CancellationToken ct = default)
    {
        try
        {
            var payload = new SuspiciousAccessDetectedPayload(
                AlertCode: entry.AlertCode,
                Description: entry.Description,
                CredentialValue: $"{entry.CredentialType}:{entry.CredentialValue}",
                ReaderId: entry.ReaderId,
                DoorId: entry.DoorId,
                StudentId: entry.StudentId,
                Attempts: entry.Attempts,
                OccurredAt: DateTimeOffset.UtcNow);

            _db.OutboxMessages.Add(new OutboxMessage(
                type: TimetableOutboxTypes.SuspiciousAccessDetected,
                payloadJson: JsonSerializer.Serialize(payload),
                correlationId: null,
                traceId: null));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "EmitSuspiciousAccessAlertAsync failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}