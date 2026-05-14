namespace UniGate.Access.Application.Admin.Doors;

public sealed record CreateDoorCommand(
    Guid ZoneId,
    Guid? RoomId,
    string Code,
    string Name);