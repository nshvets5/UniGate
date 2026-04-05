namespace UniGate.Devices.Domain;

public sealed class ReaderScanAttempt
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid ReaderId { get; private set; }

    public string CredentialType { get; private set; } = default!;
    public string CredentialValue { get; private set; } = default!;

    public Guid? CredentialId { get; private set; }
    public Guid? StudentId { get; private set; }

    public bool IsAllowed { get; private set; }
    public string ReasonCode { get; private set; } = default!;

    public DateTimeOffset OccurredAt { get; private set; } = DateTimeOffset.UtcNow;

    private ReaderScanAttempt() { }

    public ReaderScanAttempt(
        Guid readerId,
        string credentialType,
        string credentialValue,
        Guid? credentialId,
        Guid? studentId,
        bool isAllowed,
        string reasonCode)
    {
        ReaderId = readerId;
        CredentialType = credentialType.Trim().ToLowerInvariant();
        CredentialValue = credentialValue.Trim();
        CredentialId = credentialId;
        StudentId = studentId;
        IsAllowed = isAllowed;
        ReasonCode = reasonCode;
        OccurredAt = DateTimeOffset.UtcNow;
    }
}