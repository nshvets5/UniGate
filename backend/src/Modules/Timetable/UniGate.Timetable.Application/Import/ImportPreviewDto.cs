using UniGate.Timetable.Application.Diff;

namespace UniGate.Timetable.Application.Import;

public sealed record ImportPreviewDto(
    string PreviewToken,
    ImportReport Report,
    TimetableBatchDiffDto? Diff);