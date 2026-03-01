namespace UniGate.Access.Domain;

public sealed class Zone
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Code { get; private set; } = default!;
    public string Name { get; private set; } = default!;
    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private Zone() { }

    public Zone(string code, string name)
    {
        Code = code;
        Name = name;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Rename(string name) => Name = name;
    public void ChangeCode(string code) => Code = code;
    public void SetActive(bool isActive) => IsActive = isActive;
}