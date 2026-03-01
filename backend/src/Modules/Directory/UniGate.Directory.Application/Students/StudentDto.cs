namespace UniGate.Directory.Application.Students;

public sealed record StudentDto(
    Guid Id,
    Guid GroupId,
    string FirstName,
    string LastName,
    string? MiddleName,
    string Email,
    Guid? IamProfileId,
    bool IsActive,
    DateTimeOffset CreatedAt);