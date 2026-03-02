using UniGate.Access.Application.Admin.Doors;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Doors;

public sealed class ListDoorsUseCase
{
    private readonly IAccessAdminStore _store;

    public ListDoorsUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<PagedResult<DoorDto>>> ExecuteAsync(
        Guid? zoneId,
        string? search,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        if (page < 1 || pageSize is < 1 or > 200)
            return Task.FromResult(Result<PagedResult<DoorDto>>.Failure(Errors.Validation.Failed("Invalid paging.")));

        return _store.ListDoorsAsync(zoneId, search, page, pageSize, ct);
    }
}