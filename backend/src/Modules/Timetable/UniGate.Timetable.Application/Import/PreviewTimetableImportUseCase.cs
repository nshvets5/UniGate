using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import;

public sealed class PreviewTimetableImportUseCase
{
    private readonly TimetableImportWorkflow _workflow;

    public PreviewTimetableImportUseCase(TimetableImportWorkflow workflow)
    {
        _workflow = workflow;
    }

    public async Task<Result<ImportPreviewDto>> ExecuteAsync(
        ITimetableImportSourceParser parser,
        TimetableParseRequest request,
        CancellationToken ct = default)
    {
        var parsed = await parser.ParseAsync(request, ct);
        if (!parsed.IsSuccess)
            return Result<ImportPreviewDto>.Failure(parsed.Error);

        return await _workflow.BuildPreviewAsync(
            parsed: parsed.Value,
            sourceFileName: request.SourceFileName,
            ct: ct);
    }
}