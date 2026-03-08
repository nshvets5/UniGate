using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Diff;

public sealed class GetTimetableBatchDiffUseCase
{
    private readonly ITimetableBatchDiffQuery _query;

    public GetTimetableBatchDiffUseCase(ITimetableBatchDiffQuery query)
    {
        _query = query;
    }

    public Task<Result<TimetableBatchDiffDto>> ExecuteAsync(Guid oldBatchId, Guid newBatchId, CancellationToken ct = default)
    {
        if (oldBatchId == Guid.Empty || newBatchId == Guid.Empty)
            return Task.FromResult(Result<TimetableBatchDiffDto>.Failure(
                Errors.Validation.Failed("OldBatchId and NewBatchId are required.")));

        if (oldBatchId == newBatchId)
            return Task.FromResult(Result<TimetableBatchDiffDto>.Failure(
                Errors.Validation.Failed("OldBatchId and NewBatchId must be different.")));

        return _query.GetDiffAsync(oldBatchId, newBatchId, ct);
    }
}