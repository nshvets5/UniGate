namespace UniGate.Access.Application.Decision;

public sealed record CheckAccessCommand(
    Guid StudentId,
    Guid DoorId);