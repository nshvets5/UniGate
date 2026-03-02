using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases;

public sealed class SetZoneActiveUseCase
{
    private readonly IAccessAdminStore _store;
    public SetZoneActiveUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result> ExecuteAsync(Guid id, bool isActive, CancellationToken ct)
        => id == Guid.Empty
            ? Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")))
            : _store.SetZoneActiveAsync(id, isActive, ct);
}