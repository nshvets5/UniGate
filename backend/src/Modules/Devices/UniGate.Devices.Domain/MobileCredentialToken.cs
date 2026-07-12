namespace UniGate.Devices.Domain;

public sealed class MobileCredentialToken
{
    public Guid Id { get; private set; }

    public Guid StudentId { get; private set; }

    public DateTimeOffset IssuedAt { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }

    public DateTimeOffset? UsedAt { get; private set; }

    private MobileCredentialToken()
    {
    }

    public MobileCredentialToken(
        Guid id,
        Guid studentId,
        DateTimeOffset issuedAt,
        DateTimeOffset expiresAt)
    {
        if (id == Guid.Empty)
            throw new InvalidOperationException("Token id is required.");

        if (studentId == Guid.Empty)
            throw new InvalidOperationException("Student id is required.");

        if (expiresAt <= issuedAt)
            throw new InvalidOperationException(
                "Expiration time must be later than issue time.");

        Id = id;
        StudentId = studentId;
        IssuedAt = issuedAt;
        ExpiresAt = expiresAt;
        UsedAt = null;
    }

    public bool CanBeUsedAt(DateTimeOffset nowUtc)
    {
        return UsedAt is null && nowUtc <= ExpiresAt;
    }

    public void MarkUsed(DateTimeOffset usedAt)
    {
        if (UsedAt is not null)
            throw new InvalidOperationException(
                "Mobile credential token has already been used.");

        UsedAt = usedAt;
    }
}