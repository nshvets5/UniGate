using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Doors;

public sealed class SetDoorActiveUseCase
{
    private readonly IAccessAdminStore _store;

    public SetDoorActiveUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result> ExecuteAsync(Guid id, bool isActive, CancellationToken ct)
        => id == Guid.Empty
            ? Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")))
            : _store.SetDoorActiveAsync(id, isActive, ct);
}