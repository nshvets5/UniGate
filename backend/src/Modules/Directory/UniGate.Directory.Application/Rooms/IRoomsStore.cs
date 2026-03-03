using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Rooms;

public interface IRoomsStore
{
    Task<Result<Guid>> CreateAsync(CreateRoomCommand cmd, CancellationToken ct);
    Task<Result<PagedResult<RoomDto>>> ListAsync(string? search, int page, int pageSize, CancellationToken ct);
    Task<Result<RoomDto>> GetAsync(Guid id, CancellationToken ct);
    Task<Result<RoomDto>> GetByCodeAsync(string code, CancellationToken ct);
    Task<Result> UpdateAsync(UpdateRoomCommand cmd, CancellationToken ct);
    Task<Result> SetActiveAsync(Guid id, bool isActive, CancellationToken ct);
}