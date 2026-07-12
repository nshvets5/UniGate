using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Attempts;

public sealed class GetStudentAccessSummaryUseCase
{
    private readonly IReaderScanAttemptsQueryStore _store;

    public GetStudentAccessSummaryUseCase(
        IReaderScanAttemptsQueryStore store)
    {
        _store = store;
    }

    public Task<Result<StudentAccessSummaryDto>> ExecuteAsync(
        Guid studentId,
        CancellationToken ct = default)
    {
        if (studentId == Guid.Empty)
        {
            return Task.FromResult(
                Result<StudentAccessSummaryDto>.Failure(
                    Errors.Validation.Failed(
                        "StudentId is required.")));
        }

        return _store.GetStudentSummaryAsync(studentId, ct);
    }
}