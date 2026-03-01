using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Groups;

public interface IGroupStore
{
    Task<Result<Guid>> CreateAsync(CreateGroupCommand cmd, CancellationToken ct = default);

    Task<Result<PagedResult<GroupDto>>> ListAsync(ListGroupsQuery query, CancellationToken ct = default);
}