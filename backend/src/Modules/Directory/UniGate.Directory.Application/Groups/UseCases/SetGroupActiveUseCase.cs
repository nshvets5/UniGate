using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Groups.UseCases;

public sealed class SetGroupActiveUseCase
{
    private readonly IGroupStore _store;

    public SetGroupActiveUseCase(IGroupStore store) => _store = store;

    public Task<Result> ExecuteAsync(SetGroupActiveCommand cmd, CancellationToken ct = default)
    {
        if (cmd.Id == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")));

        return _store.SetActiveAsync(cmd, ct);
    }
}