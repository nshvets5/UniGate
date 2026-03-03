namespace UniGate.Access.Domain;

public sealed class RuleWindow
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid RuleId { get; private set; }

    public int DayOfWeekIso { get; private set; }

    public TimeOnly StartTime { get; private set; }
    public TimeOnly EndTime { get; private set; }

    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private RuleWindow() { }

    public RuleWindow(Guid ruleId, int dayOfWeekIso, TimeOnly start, TimeOnly end)
    {
        RuleId = ruleId;
        DayOfWeekIso = dayOfWeekIso;
        StartTime = start;
        EndTime = end;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void SetActive(bool isActive) => IsActive = isActive;
}