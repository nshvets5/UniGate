namespace UniGate.Directory.Application.Groups;

public sealed record UpdateGroupCommand(
    Guid Id,
    string Code,
    string Name,
    int AdmissionYear);