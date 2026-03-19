namespace UniGate.Devices.Domain;

public sealed class ReaderDevice
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Code { get; private set; } = default!;
    public string Name { get; private set; } = default!;

    public Guid DoorId { get; private set; }

    public ReaderDeviceType Type { get; private set; }

    public bool IsActive { get; private set; } = true;

    public string? ApiKeyHash { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastSeenAt { get; private set; }

    private ReaderDevice() { }

    public ReaderDevice(string code, string name, Guid doorId, ReaderDeviceType type)
    {
        Code = code.Trim();
        Name = name.Trim();
        DoorId = doorId;
        Type = type;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Rename(string name) => Name = name.Trim();

    public void ChangeCode(string code) => Code = code.Trim();

    public void ChangeDoor(Guid doorId) => DoorId = doorId;

    public void ChangeType(ReaderDeviceType type) => Type = type;

    public void SetActive(bool isActive) => IsActive = isActive;

    public void SetApiKeyHash(string? apiKeyHash) => ApiKeyHash = apiKeyHash;

    public void Touch()
    {
        LastSeenAt = DateTimeOffset.UtcNow;
    }
}