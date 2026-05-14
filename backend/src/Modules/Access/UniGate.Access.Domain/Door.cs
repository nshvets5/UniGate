namespace UniGate.Access.Domain;

public sealed class Door
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid ZoneId { get; private set; }
    public Guid? RoomId { get; private set; }

    public string Code { get; private set; } = default!;
    public string Name { get; private set; } = default!;
    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private Door() { }

    public Door(Guid zoneId, Guid? roomId, string code, string name)
    {
        if (zoneId == Guid.Empty)
            throw new InvalidOperationException("ZoneId is required.");

        if (string.IsNullOrWhiteSpace(code))
            throw new InvalidOperationException("Door code is required.");

        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("Door name is required.");

        ZoneId = zoneId;
        RoomId = roomId;
        Code = code.Trim();
        Name = name.Trim();
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Rename(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new InvalidOperationException("Door name is required.");

        Name = name.Trim();
    }

    public void ChangeCode(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new InvalidOperationException("Door code is required.");

        Code = code.Trim();
    }

    public void Move(Guid zoneId, Guid? roomId)
    {
        if (zoneId == Guid.Empty)
            throw new InvalidOperationException("ZoneId is required.");

        ZoneId = zoneId;
        RoomId = roomId;
    }

    public void SetActive(bool isActive) => IsActive = isActive;
}