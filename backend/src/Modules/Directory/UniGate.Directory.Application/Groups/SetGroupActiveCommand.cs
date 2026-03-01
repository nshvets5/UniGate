namespace UniGate.Directory.Application.Groups;

public sealed record SetGroupActiveCommand(
    Guid Id,
    bool IsActive);