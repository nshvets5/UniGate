using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Scan;

public interface ICredentialResolver
{
    Task<Result<ResolvedCredentialDto>> ResolveAsync(string type, string value, CancellationToken ct = default);
}

public sealed record ResolvedCredentialDto(
    Guid CredentialId,
    Guid StudentId,
    Guid GroupId,
    bool StudentIsActive,
    bool CredentialIsActive);