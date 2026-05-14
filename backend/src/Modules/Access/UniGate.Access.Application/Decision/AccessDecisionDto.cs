using UniGate.SharedKernel.Access;

namespace UniGate.Access.Application.Decision;

public sealed record AccessDecisionDto(
    bool Allowed,
    string Reason,
    Guid DoorId,
    Guid? ZoneId,
    Guid? RoomId,
    Guid StudentId,
    Guid GroupId,
    Guid? MatchedRuleId,
    AccessTargetType? MatchedTargetType,
    Guid? MatchedTargetId);