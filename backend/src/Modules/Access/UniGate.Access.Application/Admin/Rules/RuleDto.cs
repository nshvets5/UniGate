using UniGate.SharedKernel.Access;

namespace UniGate.Access.Application.Admin.Rules;

public sealed record RuleDto(
    Guid Id,
    Guid GroupId,
    AccessTargetType TargetType,
    Guid TargetId,
    bool IsActive,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo,
    DateTimeOffset CreatedAt);