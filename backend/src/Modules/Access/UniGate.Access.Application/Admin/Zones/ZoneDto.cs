namespace UniGate.Access.Application.Admin.Zones;

public sealed record ZoneDto(Guid Id, string Code, string Name, bool IsActive, DateTimeOffset CreatedAt);