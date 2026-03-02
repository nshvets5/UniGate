namespace UniGate.Access.Application.Admin;

public sealed record UpdateZoneCommand(Guid Id, string Code, string Name);