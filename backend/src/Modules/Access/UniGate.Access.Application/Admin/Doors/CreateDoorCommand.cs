namespace UniGate.Access.Application.Admin.Doors;

public sealed record CreateDoorCommand(Guid ZoneId, string Code, string Name);