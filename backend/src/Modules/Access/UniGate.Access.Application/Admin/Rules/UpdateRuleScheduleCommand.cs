using UniGate.SharedKernel.Access;

namespace UniGate.Access.Application.Admin.Rules;

public sealed record UpdateRuleScheduleCommand(
    Guid Id,
    IReadOnlyList<RuleWindowDto> Windows,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo);