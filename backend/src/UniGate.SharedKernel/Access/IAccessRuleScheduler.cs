using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Access;

public sealed record RuleWindowDto(int DayOfWeekIso, TimeOnly StartTime, TimeOnly EndTime);

public sealed record RuleScheduleV2(
    IReadOnlyList<RuleWindowDto> Windows,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo);

public interface IAccessRuleScheduler
{
    Task<Result<Guid>> EnsureRuleAsync(Guid zoneId, Guid groupId, CancellationToken ct = default);

    Task<Result> ReplaceWindowsAsync(Guid ruleId, RuleScheduleV2 schedule, CancellationToken ct = default);
}