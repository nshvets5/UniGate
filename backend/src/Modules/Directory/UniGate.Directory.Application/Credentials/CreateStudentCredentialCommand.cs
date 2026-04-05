namespace UniGate.Directory.Application.Credentials;

public sealed record CreateStudentCredentialCommand(
    Guid StudentId,
    string Type,
    string Value);