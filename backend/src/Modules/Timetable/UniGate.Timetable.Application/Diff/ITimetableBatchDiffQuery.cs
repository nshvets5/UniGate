using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Diff;

public interface ITimetableBatchDiffQuery
{
    Task<Result<TimetableBatchDiffDto>> GetDiffAsync(Guid oldBatchId, Guid newBatchId, CancellationToken ct = default);
}