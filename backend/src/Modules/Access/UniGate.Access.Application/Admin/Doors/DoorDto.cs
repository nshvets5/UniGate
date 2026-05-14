namespace UniGate.Access.Application.Admin.Doors;

public sealed record DoorDto(
    Guid Id,
    Guid ZoneId,
    Guid? RoomId,
    string Code,
    string Name,
    bool IsActive,
    DateTimeOffset CreatedAt);