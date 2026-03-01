namespace UniGate.Directory.Application.Students;

public sealed record CreateStudentCommand(
    Guid GroupId,
    string FirstName,
    string LastName,
    string? MiddleName,
    string Email);