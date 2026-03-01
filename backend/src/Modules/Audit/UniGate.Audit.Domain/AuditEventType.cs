namespace UniGate.Audit.Domain;

public static class AuditEventType
{
    public const string UserProfileProvisioned = "user.profile_provisioned";
    public const string AuthenticatedRequest = "auth.authenticated_request";
    public const string AccessAttempt = "access.attempt";
    public const string AccessGranted = "access.granted";
    public const string AccessDenied = "access.denied";
}
