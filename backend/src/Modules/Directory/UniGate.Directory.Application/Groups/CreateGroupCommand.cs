namespace UniGate.Directory.Application.Groups;

public sealed record CreateGroupCommand(
    string Code,
    string Name,
    int AdmissionYear);