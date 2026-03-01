namespace UniGate.Access.Domain;

public sealed class Door
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid ZoneId { get; private set; }

    public string Code { get; private set; } = default!;
    public string Name { get; private set; } = default!;
    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private Door() { }

    public Door(Guid zoneId, string code, string name)
    {
        ZoneId = zoneId;
        Code = code;
        Name = name;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Rename(string name) => Name = name;
    public void ChangeCode(string code) => Code = code;
    public void MoveToZone(Guid zoneId) => ZoneId = zoneId;
    public void SetActive(bool isActive) => IsActive = isActive;
}