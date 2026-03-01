using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Auth;

public interface IProfileLookup
{
    Task<Result<Guid?>> FindProfileIdByEmailAsync(string email, CancellationToken ct = default);
}