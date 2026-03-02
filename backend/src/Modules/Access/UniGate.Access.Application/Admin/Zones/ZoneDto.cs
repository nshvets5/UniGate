namespace UniGate.Access.Application.Admin;

public sealed record ZoneDto(Guid Id, string Code, string Name, bool IsActive, DateTimeOffset CreatedAt);