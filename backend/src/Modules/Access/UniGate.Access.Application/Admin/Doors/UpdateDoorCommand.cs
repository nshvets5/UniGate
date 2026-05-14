namespace UniGate.Access.Application.Admin.Doors;

public sealed record UpdateDoorCommand(
    Guid Id,
    Guid ZoneId,
    Guid? RoomId,
    string Code,
    string Name);