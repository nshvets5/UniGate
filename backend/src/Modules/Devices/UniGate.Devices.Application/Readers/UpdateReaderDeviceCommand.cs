using UniGate.Devices.Domain;

namespace UniGate.Devices.Application.Readers;

public sealed record UpdateReaderDeviceCommand(
    Guid Id,
    string Code,
    string Name,
    Guid DoorId,
    ReaderDeviceType Type);