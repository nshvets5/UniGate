namespace UniGate.Access.Application.Admin.Zones;

public sealed record UpdateZoneCommand(Guid Id, string Code, string Name);