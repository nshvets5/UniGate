using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Directory;

public sealed record StudentRef(
    Guid StudentId,
    Guid GroupId,
    Guid IamProfileId,
    bool IsActive);

public interface IStudentLookup
{
    Task<Result<StudentRef>> FindByProfileIdAsync(Guid iamProfileId, CancellationToken ct = default);
}