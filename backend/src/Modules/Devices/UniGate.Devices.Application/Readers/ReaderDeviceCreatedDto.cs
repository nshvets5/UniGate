namespace UniGate.Devices.Application.Readers;

public sealed record ReaderDeviceCreatedDto(
    Guid Id,
    string ApiKey);