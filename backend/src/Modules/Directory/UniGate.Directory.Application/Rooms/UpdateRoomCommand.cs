namespace UniGate.Directory.Application.Rooms;

public sealed record UpdateRoomCommand(Guid Id, string Code, string Name, Guid ZoneId);