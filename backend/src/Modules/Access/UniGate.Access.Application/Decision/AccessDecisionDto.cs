namespace UniGate.Access.Application.Decision;

public sealed record AccessDecisionDto(
    bool Allowed,
    string Reason,
    Guid DoorId,
    Guid ZoneId,
    Guid StudentId,
    Guid GroupId);