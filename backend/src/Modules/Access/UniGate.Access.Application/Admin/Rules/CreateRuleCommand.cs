using UniGate.SharedKernel.Access;

namespace UniGate.Access.Application.Admin.Rules;

public sealed record CreateRuleCommand(
    Guid ZoneId,
    Guid GroupId,
    IReadOnlyList<RuleWindowDto> Windows,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo);