using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Scan;

public interface ISuspiciousAccessDetector
{
    Task<Result<SuspiciousAccessDetectionResult>> CheckAsync(
        string credentialType,
        string credentialValue,
        CancellationToken ct = default);
}

public sealed record SuspiciousAccessDetectionResult(
    bool IsSuspicious,
    int Attempts,
    string AlertCode,
    string Description);