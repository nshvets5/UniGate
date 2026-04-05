namespace UniGate.Devices.Application.Scan;

public sealed record ReaderScanCommand(
    Guid ReaderId,
    string CredentialType,
    string CredentialValue);