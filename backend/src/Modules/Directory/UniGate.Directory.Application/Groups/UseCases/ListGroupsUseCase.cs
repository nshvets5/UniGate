using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Groups.UseCases;

public sealed class ListGroupsUseCase
{
    private readonly IGroupStore _store;

    public ListGroupsUseCase(IGroupStore store)
    {
        _store = store;
    }

    public Task<Result<PagedResult<GroupDto>>> ExecuteAsync(ListGroupsQuery query, CancellationToken ct = default)
    {
        if (query.Page < 1)
            return Task.FromResult(Result<PagedResult<GroupDto>>.Failure(Errors.Validation.Failed("Page must be >= 1.")));

        if (query.PageSize is < 1 or > 200)
            return Task.FromResult(Result<PagedResult<GroupDto>>.Failure(Errors.Validation.Failed("PageSize must be between 1 and 200.")));

        return _store.ListAsync(query, ct);
    }
}