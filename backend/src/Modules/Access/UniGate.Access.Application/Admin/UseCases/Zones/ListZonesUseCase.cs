using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases;

public sealed class ListZonesUseCase
{
    private readonly IAccessAdminStore _store;
    public ListZonesUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<PagedResult<ZoneDto>>> ExecuteAsync(string? search, int page, int pageSize, CancellationToken ct)
    {
        if (page < 1 || pageSize is < 1 or > 200)
            return Task.FromResult(Result<PagedResult<ZoneDto>>.Failure(Errors.Validation.Failed("Invalid paging.")));

        return _store.ListZonesAsync(search, page, pageSize, ct);
    }
}