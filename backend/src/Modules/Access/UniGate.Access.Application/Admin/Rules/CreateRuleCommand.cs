namespace UniGate.Access.Application.Admin;

public sealed record CreateRuleCommand(Guid ZoneId, Guid GroupId);