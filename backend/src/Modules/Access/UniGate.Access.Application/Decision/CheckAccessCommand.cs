namespace UniGate.Access.Application.Decision;

public sealed record CheckAccessCommand(Guid DoorId, Guid IamProfileId);