namespace UniGate.Access.Application.Admin;

public sealed record DoorDto(Guid Id, Guid ZoneId, string Code, string Name, bool IsActive, DateTimeOffset CreatedAt);