namespace UniGate.Directory.Domain;

public static class StudentOutboxTypes
{
    public const string StudentCreated = "directory.student_created";
    public const string StudentUpdated = "directory.student_updated";
    public const string StudentActiveChanged = "directory.student_active_changed";
    public const string StudentGroupChanged = "directory.student_group_changed";
    public const string StudentProfileBound = "directory.student_profile_bound";
}