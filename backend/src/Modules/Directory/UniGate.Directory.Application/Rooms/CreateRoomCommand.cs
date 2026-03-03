namespace UniGate.Directory.Application.Rooms;

public sealed record CreateRoomCommand(string Code, string Name, Guid ZoneId);