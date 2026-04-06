namespace UniGate.Devices.Application.Readers;

public sealed record ReaderApiKeyRotatedDto(
    Guid Id,
    string Code,
    string ApiKey);