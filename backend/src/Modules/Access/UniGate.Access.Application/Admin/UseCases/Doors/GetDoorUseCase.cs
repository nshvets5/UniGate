using UniGate.Access.Application.Admin.Doors;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Doors;

public sealed class GetDoorUseCase
{
    private readonly IAccessAdminStore _store;

    public GetDoorUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<DoorDto>> ExecuteAsync(Guid id, CancellationToken ct)
        => id == Guid.Empty
            ? Task.FromResult(Result<DoorDto>.Failure(Errors.Validation.Failed("Id is required.")))
            : _store.GetDoorAsync(id, ct);
}