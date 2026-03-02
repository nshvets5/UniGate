using UniGate.SharedKernel.Results;

namespace UniGate.Api.Security;

public interface ICurrentProfileIdAccessor
{
    Task<Result<Guid>> GetRequiredProfileIdAsync(CancellationToken ct = default);
}