namespace UniGate.Access.Application.Admin.Doors;

public sealed record UpdateDoorCommand(Guid Id, Guid ZoneId, string Code, string Name);