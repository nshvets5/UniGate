using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Decision;

public interface IAccessDecisionStore
{
    Task<Result<AccessDecisionDto>> CheckAsync(
        Guid studentId,
        Guid doorId,
        DateTimeOffset nowUtc,
        CancellationToken ct = default);
}