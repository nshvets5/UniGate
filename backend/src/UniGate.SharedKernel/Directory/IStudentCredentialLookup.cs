using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Directory;

public sealed record StudentCredentialRef(
    Guid CredentialId,
    Guid StudentId,
    Guid GroupId,
    bool StudentIsActive,
    bool CredentialIsActive);

public interface IStudentCredentialLookup
{
    Task<Result<StudentCredentialRef>> ResolveAsync(string type, string value, CancellationToken ct = default);
}