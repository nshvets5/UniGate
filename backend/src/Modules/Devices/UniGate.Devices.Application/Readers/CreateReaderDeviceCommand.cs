using UniGate.Devices.Domain;

namespace UniGate.Devices.Application.Readers;

public sealed record CreateReaderDeviceCommand(
    string Code,
    string Name,
    Guid DoorId,
    ReaderDeviceType Type);