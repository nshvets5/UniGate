using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Access;

public sealed record RuleSchedule(
    int? DaysMask,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo);

public interface IAccessRuleScheduler
{
    Task<Result<Guid>> EnsureRuleAsync(Guid zoneId, Guid groupId, CancellationToken ct = default);

    Task<Result> UpdateScheduleAsync(Guid ruleId, RuleSchedule schedule, CancellationToken ct = default);
}