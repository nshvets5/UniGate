namespace UniGate.SharedKernel.Outbox;

public static class TimetableOutboxTypes
{
    public const string ImportCompleted = "timetable.import_completed";
    public const string SuspiciousAccessDetected = "security.suspicious_access_detected";
    public const string HealthAlertRaised = "system.health_alert_raised";
}