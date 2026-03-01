namespace UniGate.Directory.Application.Students;

public sealed record BindStudentProfileCommand(Guid Id, Guid IamProfileId);