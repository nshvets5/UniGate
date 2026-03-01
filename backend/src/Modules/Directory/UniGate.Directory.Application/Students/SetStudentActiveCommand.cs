namespace UniGate.Directory.Application.Students;

public sealed record SetStudentActiveCommand(Guid Id, bool IsActive);