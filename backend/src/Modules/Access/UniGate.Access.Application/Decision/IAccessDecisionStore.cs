using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Decision;

public interface IAccessDecisionStore
{
    Task<Result<(Guid ZoneId, bool DoorActive, bool ZoneActive)>> GetDoorZoneAsync(Guid doorId, CancellationToken ct);

    Task<Result<bool>> HasActiveRuleAsync(Guid zoneId, Guid groupId, CancellationToken ct);
}