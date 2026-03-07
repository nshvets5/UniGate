namespace UniGate.Timetable.Domain;

public sealed class TimetableSlot
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid BatchId { get; private set; }
    public Guid GroupId { get; private set; }
    public Guid ZoneId { get; private set; }

    public int DayOfWeekIso { get; private set; }

    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }

    public DateTimeOffset? ValidFrom { get; private set; }
    public DateTimeOffset? ValidTo { get; private set; }

    public string? Title { get; private set; }
    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private TimetableSlot() { }

    public TimetableSlot(
        Guid batchId,
        Guid groupId,
        Guid zoneId,
        int dayOfWeekIso,
        TimeOnly start,
        TimeOnly end,
        DateTimeOffset? validFrom,
        DateTimeOffset? validTo,
        string? title)
    {
        BatchId = batchId;
        GroupId = groupId;
        ZoneId = zoneId;
        DayOfWeekIso = dayOfWeekIso;
        StartTime = start;
        EndTime = end;
        ValidFrom = validFrom;
        ValidTo = validTo;
        Title = title;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void SetActive(bool isActive) => IsActive = isActive;
}