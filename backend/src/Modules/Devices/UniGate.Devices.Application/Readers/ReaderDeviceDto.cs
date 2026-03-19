using UniGate.Devices.Domain;

namespace UniGate.Devices.Application.Readers;

public sealed record ReaderDeviceDto(
    Guid Id,
    string Code,
    string Name,
    Guid DoorId,
    ReaderDeviceType Type,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset? LastSeenAt);