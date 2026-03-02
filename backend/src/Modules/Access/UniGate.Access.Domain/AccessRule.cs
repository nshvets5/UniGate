namespace UniGate.Access.Domain;

public sealed class AccessRule
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid ZoneId { get; private set; }
    public Guid GroupId { get; private set; }

    public bool IsActive { get; private set; } = true;

    public int? DaysMask { get; private set; }

    public TimeOnly? StartTime { get; private set; }
    public TimeOnly? EndTime { get; private set; }

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

    public void SetSchedule(int? daysMask, TimeOnly? startTime, TimeOnly? endTime, DateTimeOffset? validFrom, DateTimeOffset? validTo)
    {
        if ((startTime is null) != (endTime is null))
            throw new InvalidOperationException("StartTime and EndTime must be both set or both null.");

        if (validFrom is not null && validTo is not null && validTo < validFrom)
            throw new InvalidOperationException("ValidTo must be >= ValidFrom.");

        if (daysMask is 0)
            daysMask = null;

        DaysMask = daysMask;
        StartTime = startTime;
        EndTime = endTime;
        ValidFrom = validFrom;
        ValidTo = validTo;
    }

    public bool IsAllowedAtLocal(DateTimeOffset nowUtc, TimeZoneInfo tz)
    {
        if (!IsActive) return false;

        if (ValidFrom is not null && nowUtc < ValidFrom.Value) return false;
        if (ValidTo is not null && nowUtc > ValidTo.Value) return false;

        var local = TimeZoneInfo.ConvertTime(nowUtc, tz);

        if (DaysMask is not null)
        {
            var bit = DayToBit(local.DayOfWeek);
            if ((DaysMask.Value & bit) == 0) return false;
        }

        if (StartTime is not null && EndTime is not null)
        {
            var t = TimeOnly.FromDateTime(local.DateTime);

            if (EndTime.Value >= StartTime.Value)
            {
                if (t < StartTime.Value || t > EndTime.Value) return false;
            }
            else
            {
                if (t < StartTime.Value && t > EndTime.Value) return false;
            }
        }

        return true;
    }

    private static int DayToBit(DayOfWeek day) => day switch
    {
        DayOfWeek.Monday => 1,
        DayOfWeek.Tuesday => 2,
        DayOfWeek.Wednesday => 4,
        DayOfWeek.Thursday => 8,
        DayOfWeek.Friday => 16,
        DayOfWeek.Saturday => 32,
        DayOfWeek.Sunday => 64,
        _ => 0
    };
}