using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Credentials;

public interface IStudentCredentialStore
{
    Task<Result<Guid>> CreateAsync(CreateStudentCredentialCommand cmd, CancellationToken ct = default);

    Task<Result<IReadOnlyList<StudentCredentialDto>>> ListByStudentAsync(Guid studentId, CancellationToken ct = default);

    Task<Result> SetActiveAsync(Guid credentialId, bool isActive, CancellationToken ct = default);

    Task<Result<ResolvedCredentialStudentDto>> ResolveAsync(string type, string value, CancellationToken ct = default);
}

public sealed record ResolvedCredentialStudentDto(
    Guid CredentialId,
    Guid StudentId,
    Guid GroupId,
    string Email,
    bool StudentIsActive,
    bool CredentialIsActive);