using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Scan;

public interface IAccessDecisionGateway
{
    Task<Result<bool>> CheckStudentDoorAccessAsync(Guid studentId, Guid doorId, CancellationToken ct = default);
}