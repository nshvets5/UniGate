using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Diff;

public interface ITimetablePreviewDiffService
{
    Task<Result<TimetableBatchDiffDto?>> DiffAgainstActiveAsync(
        IReadOnlyList<Timetable.Application.ImportSlotRow> incomingRows,
        CancellationToken ct = default);
}