namespace UniGate.Access.Domain;

public sealed class AccessRule
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid ZoneId { get; private set; }
    public Guid GroupId { get; private set; }

    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private AccessRule() { }

    public AccessRule(Guid zoneId, Guid groupId)
    {
        ZoneId = zoneId;
        GroupId = groupId;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void SetActive(bool isActive) => IsActive = isActive;
}