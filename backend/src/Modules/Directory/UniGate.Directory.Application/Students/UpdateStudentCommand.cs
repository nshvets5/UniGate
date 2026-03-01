namespace UniGate.Directory.Application.Students;

public sealed record UpdateStudentCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string? MiddleName,
    string Email);