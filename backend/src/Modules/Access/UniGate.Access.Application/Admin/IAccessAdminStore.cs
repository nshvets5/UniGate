using UniGate.Access.Application.Admin.Doors;
using UniGate.Access.Application.Admin.Rules;
using UniGate.Access.Application.Admin.Zones;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin;

public interface IAccessAdminStore
{
    // Zones
    Task<Result<Guid>> CreateZoneAsync(CreateZoneCommand cmd, CancellationToken ct);
    Task<Result<PagedResult<ZoneDto>>> ListZonesAsync(string? search, int page, int pageSize, CancellationToken ct);
    Task<Result<ZoneDto>> GetZoneAsync(Guid id, CancellationToken ct);
    Task<Result> UpdateZoneAsync(UpdateZoneCommand cmd, CancellationToken ct);
    Task<Result> SetZoneActiveAsync(Guid id, bool isActive, CancellationToken ct);

    // Doors
    Task<Result<Guid>> CreateDoorAsync(CreateDoorCommand cmd, CancellationToken ct);
    Task<Result<PagedResult<DoorDto>>> ListDoorsAsync(Guid? zoneId, string? search, int page, int pageSize, CancellationToken ct);
    Task<Result<DoorDto>> GetDoorAsync(Guid id, CancellationToken ct);
    Task<Result> UpdateDoorAsync(UpdateDoorCommand cmd, CancellationToken ct);
    Task<Result> SetDoorActiveAsync(Guid id, bool isActive, CancellationToken ct);

    // Rules
    Task<Result<Guid>> CreateRuleAsync(CreateRuleCommand cmd, CancellationToken ct);
    Task<Result<PagedResult<RuleDto>>> ListRulesAsync(Guid? zoneId, Guid? groupId, bool? isActive, int page, int pageSize, CancellationToken ct);
    Task<Result> SetRuleActiveAsync(Guid id, bool isActive, CancellationToken ct);
}