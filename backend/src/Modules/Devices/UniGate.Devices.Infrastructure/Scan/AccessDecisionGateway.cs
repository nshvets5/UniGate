using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Scan;
using UniGate.SharedKernel.Access;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Scan;

public sealed class AccessDecisionGateway : IAccessDecisionGateway
{
    private readonly IStudentDoorAccessChecker _checker;
    private readonly ILogger<AccessDecisionGateway> _logger;

    public AccessDecisionGateway(
        IStudentDoorAccessChecker checker,
        ILogger<AccessDecisionGateway> logger)
    {
        _checker = checker;
        _logger = logger;
    }

    public async Task<Result<bool>> CheckStudentDoorAccessAsync(Guid studentId, Guid doorId, CancellationToken ct = default)
    {
        try
        {
            return await _checker.CheckAsync(studentId, doorId, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Access decision bridge failed");
            return Result<bool>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}