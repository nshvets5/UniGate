namespace UniGate.Directory.Application.Credentials;

public sealed record StudentCredentialDto(
    Guid Id,
    Guid StudentId,
    string Type,
    string Value,
    bool IsActive,
    DateTimeOffset CreatedAt);