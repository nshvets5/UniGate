using Microsoft.Extensions.Logging;
using UniGate.Access.Application.Decision;
using UniGate.SharedKernel.Access;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Infrastructure.Integration;

public sealed class StudentDoorAccessChecker : IStudentDoorAccessChecker
{
    private readonly CheckAccessUseCase _checkAccess;
    private readonly ILogger<StudentDoorAccessChecker> _logger;

    public StudentDoorAccessChecker(
        CheckAccessUseCase checkAccess,
        ILogger<StudentDoorAccessChecker> logger)
    {
        _checkAccess = checkAccess;
        _logger = logger;
    }

    public async Task<Result<bool>> CheckAsync(Guid studentId, Guid doorId, CancellationToken ct = default)
    {
        try
        {
            var res = await _checkAccess.ExecuteAsync(new CheckAccessCommand(studentId, doorId), ct);
            if (!res.IsSuccess)
                return Result<bool>.Failure(res.Error);

            return Result<bool>.Success(res.Value.Allowed);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Student door access check bridge failed");
            return Result<bool>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}