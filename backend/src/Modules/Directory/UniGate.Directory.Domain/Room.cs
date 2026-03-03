namespace UniGate.Directory.Domain;

public sealed class Room
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Code { get; private set; } = default!;
    public string Name { get; private set; } = default!;
    public Guid ZoneId { get; private set; }

    public bool IsActive { get; private set; } = true;
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private Room() { }

    public Room(string code, string name, Guid zoneId)
    {
        Code = code.Trim();
        Name = name.Trim();
        ZoneId = zoneId;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Rename(string name) => Name = name.Trim();
    public void ChangeCode(string code) => Code = code.Trim();
    public void ChangeZone(Guid zoneId) => ZoneId = zoneId;
    public void SetActive(bool isActive) => IsActive = isActive;
}