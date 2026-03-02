namespace UniGate.Access.Application.Admin;

public sealed record UpdateDoorCommand(Guid Id, Guid ZoneId, string Code, string Name);