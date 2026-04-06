using UniGate.Devices.Domain;

namespace UniGate.Devices.Application.DeviceSelf;

public sealed record DeviceSelfDto(
    Guid ReaderId,
    string Code,
    string Name,
    Guid DoorId,
    ReaderDeviceType Type,
    bool IsActive,
    DateTimeOffset? LastSeenAt);