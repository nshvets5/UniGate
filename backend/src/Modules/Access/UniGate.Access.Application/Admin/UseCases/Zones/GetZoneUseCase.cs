using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases;

public sealed class GetZoneUseCase
{
    private readonly IAccessAdminStore _store;
    public GetZoneUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<ZoneDto>> ExecuteAsync(Guid id, CancellationToken ct)
        => id == Guid.Empty
            ? Task.FromResult(Result<ZoneDto>.Failure(Errors.Validation.Failed("Id is required.")))
            : _store.GetZoneAsync(id, ct);
}