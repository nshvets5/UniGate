using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Directory;

public interface IStudentGroupLookup
{
    Task<Result<Guid>> GetGroupIdByStudentIdAsync(Guid studentId, CancellationToken ct = default);
}