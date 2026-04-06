using UniGate.Devices.Domain;

namespace UniGate.Devices.Application.Readers;

public sealed record ReaderDeviceStatusDto(
    Guid Id,
    string Code,
    string Name,
    Guid DoorId,
    ReaderDeviceType Type,
    bool IsActive,
    bool HasApiKey,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastSeenAt,
    DateTimeOffset UtcNow,
    bool IsOnline);