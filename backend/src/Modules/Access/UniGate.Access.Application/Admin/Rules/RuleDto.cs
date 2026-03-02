namespace UniGate.Access.Application.Admin;

public sealed record RuleDto(Guid Id, Guid ZoneId, Guid GroupId, bool IsActive, DateTimeOffset CreatedAt);