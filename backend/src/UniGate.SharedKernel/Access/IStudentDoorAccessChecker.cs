using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Access;

public interface IStudentDoorAccessChecker
{
    Task<Result<bool>> CheckAsync(Guid studentId, Guid doorId, CancellationToken ct = default);
}