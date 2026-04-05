using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Scan;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Scan;

public sealed class EfSuspiciousAccessDetector : ISuspiciousAccessDetector
{
    private readonly DevicesDbContext _db;
    private readonly ILogger<EfSuspiciousAccessDetector> _logger;

    public EfSuspiciousAccessDetector(DevicesDbContext db, ILogger<EfSuspiciousAccessDetector> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<SuspiciousAccessDetectionResult>> CheckAsync(
        string credentialType,
        string credentialValue,
        CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(credentialType) || string.IsNullOrWhiteSpace(credentialValue))
                return Result<SuspiciousAccessDetectionResult>.Failure(
                    Errors.Validation.Failed("CredentialType and CredentialValue are required."));

            var type = credentialType.Trim().ToLowerInvariant();
            var value = credentialValue.Trim();
            var fromUtc = DateTimeOffset.UtcNow.AddMinutes(-10);

            var denyCount = await _db.ReaderScanAttempts.AsNoTracking()
                .Where(x =>
                    x.CredentialType == type &&
                    x.CredentialValue == value &&
                    !x.IsAllowed &&
                    x.OccurredAt >= fromUtc)
                .CountAsync(ct);

            var suspicious = denyCount >= 5;

            var result = new SuspiciousAccessDetectionResult(
                IsSuspicious: suspicious,
                Attempts: denyCount,
                AlertCode: suspicious ? "REPEATED_DENIED_ATTEMPTS" : "NONE",
                Description: suspicious
                    ? $"Credential has {denyCount} denied attempts within 10 minutes."
                    : "No suspicious activity detected.");

            return Result<SuspiciousAccessDetectionResult>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Suspicious access detection failed");
            return Result<SuspiciousAccessDetectionResult>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}