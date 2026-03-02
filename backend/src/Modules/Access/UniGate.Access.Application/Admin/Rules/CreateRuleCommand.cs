namespace UniGate.Access.Application.Admin.Rules;

public sealed record CreateRuleCommand(Guid ZoneId, Guid GroupId);