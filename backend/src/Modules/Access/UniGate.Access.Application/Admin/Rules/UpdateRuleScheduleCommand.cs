namespace UniGate.Access.Application.Admin;

public sealed record UpdateRuleScheduleCommand(
    Guid Id,
    int? DaysMask,
    TimeOnly? StartTime,
    TimeOnly? EndTime,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo);