using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Auth;

public interface IReaderAuthStore
{
    Task<Result<ReaderAuthDto>> FindByApiKeyAsync(string apiKey, CancellationToken ct = default);
}

public sealed record ReaderAuthDto(
    Guid ReaderId,
    string Code,
    bool IsActive,
    string ApiKeyHash);