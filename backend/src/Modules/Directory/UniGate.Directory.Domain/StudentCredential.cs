namespace UniGate.Directory.Domain;

public sealed class StudentCredential
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid StudentId { get; private set; }

    public string Type { get; private set; } = default!;   // rfid / qr / manual
    public string Value { get; private set; } = default!;  // uid/token/code

    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private StudentCredential() { }

    public StudentCredential(Guid studentId, string type, string value)
    {
        StudentId = studentId;
        Type = type.Trim().ToLowerInvariant();
        Value = value.Trim();
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void SetActive(bool isActive) => IsActive = isActive;
}