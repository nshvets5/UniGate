namespace UniGate.Access.Domain;

public sealed class AccessRule
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid ZoneId { get; private set; }
    public Guid GroupId { get; private set; }

    public bool IsActive { get; private set; } = true;

    public DateTimeOffset? ValidFrom { get; private set; }
    public DateTimeOffset? ValidTo { get; private set; }

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

    public void SetValidity(DateTimeOffset? validFrom, DateTimeOffset? validTo)
    {
        if (validFrom is not null && validTo is not null && validTo < validFrom)
            throw new InvalidOperationException("ValidTo must be >= ValidFrom.");

        ValidFrom = validFrom;
        ValidTo = validTo;
    }

    public bool IsValidAtUtc(DateTimeOffset nowUtc)
    {
        if (!IsActive) return false;
        if (ValidFrom is not null && nowUtc < ValidFrom.Value) return false;
        if (ValidTo is not null && nowUtc > ValidTo.Value) return false;
        return true;
    }
}