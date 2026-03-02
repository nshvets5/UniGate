namespace UniGate.Access.Application.Admin.Rules;

public sealed record RuleDto(Guid Id, Guid ZoneId, Guid GroupId, bool IsActive, DateTimeOffset CreatedAt);