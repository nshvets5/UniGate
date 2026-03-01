namespace UniGate.Directory.Application.Groups;

public sealed record GroupDto(
    Guid Id,
    string Code,
    string Name,
    int AdmissionYear,
    bool IsActive,
    DateTimeOffset CreatedAt);