using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Decision;

public sealed class CheckAccessUseCase
{
    private readonly IAccessDecisionStore _store;

    public CheckAccessUseCase(IAccessDecisionStore store)
    {
        _store = store;
    }

    public async Task<Result<AccessDecisionDto>> ExecuteAsync(CheckAccessCommand cmd, CancellationToken ct = default)
    {
        if (cmd.StudentId == Guid.Empty || cmd.DoorId == Guid.Empty)
            return Result<AccessDecisionDto>.Failure(Errors.Validation.Failed("StudentId and DoorId are required."));

        return await _store.CheckAsync(cmd.StudentId, cmd.DoorId, DateTimeOffset.UtcNow, ct);
    }
}