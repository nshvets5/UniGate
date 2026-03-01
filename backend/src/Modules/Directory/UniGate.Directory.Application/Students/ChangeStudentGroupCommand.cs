namespace UniGate.Directory.Application.Students;

public sealed record ChangeStudentGroupCommand(Guid Id, Guid GroupId);