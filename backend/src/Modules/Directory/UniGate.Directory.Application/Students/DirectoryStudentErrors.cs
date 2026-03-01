using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students;

public static class DirectoryStudentErrors
{
    public static readonly Error NotFound =
        new("students.not_found", "Student not found.");

    public static readonly Error DuplicateEmail =
        new("students.duplicate_email", "A student with the same email already exists.");

    public static readonly Error GroupNotFound =
        new("students.group_not_found", "Group not found.");
}