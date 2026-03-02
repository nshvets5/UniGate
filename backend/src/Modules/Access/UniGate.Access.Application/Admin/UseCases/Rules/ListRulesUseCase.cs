using UniGate.Access.Application.Admin.Rules;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Rules;

public sealed class ListRulesUseCase
{
    private readonly IAccessAdminStore _store;

    public ListRulesUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<PagedResult<RuleDto>>> ExecuteAsync(
        Guid? zoneId,
        Guid? groupId,
        bool? isActive,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        if (page < 1 || pageSize is < 1 or > 200)
            return Task.FromResult(Result<PagedResult<RuleDto>>.Failure(Errors.Validation.Failed("Invalid paging.")));

        return _store.ListRulesAsync(zoneId, groupId, isActive, page, pageSize, ct);
    }
}