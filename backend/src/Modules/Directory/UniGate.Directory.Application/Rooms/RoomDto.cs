namespace UniGate.Directory.Application.Rooms;

public sealed record RoomDto(Guid Id, string Code, string Name, Guid ZoneId, bool IsActive, DateTimeOffset CreatedAt);