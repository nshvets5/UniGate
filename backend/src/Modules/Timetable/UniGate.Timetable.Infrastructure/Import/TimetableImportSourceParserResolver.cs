using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Import;

namespace UniGate.Timetable.Infrastructure.Import;

public sealed class TimetableImportSourceParserResolver : ITimetableImportSourceParserResolver
{
    private readonly IReadOnlyDictionary<string, ITimetableImportSourceParser> _parsers;

    public TimetableImportSourceParserResolver(IEnumerable<ITimetableImportSourceParser> parsers)
    {
        _parsers = parsers.ToDictionary(
            x => x.SourceType.Trim().ToLowerInvariant(),
            x => x);
    }

    public Result<ITimetableImportSourceParser> Resolve(string sourceType)
    {
        if (string.IsNullOrWhiteSpace(sourceType))
            return Result<ITimetableImportSourceParser>.Failure(
                Errors.Validation.Failed("Source type is required."));

        var key = sourceType.Trim().ToLowerInvariant();

        if (!_parsers.TryGetValue(key, out var parser))
            return Result<ITimetableImportSourceParser>.Failure(
                new Error("timetable.source_type_not_supported", $"Source type '{sourceType}' is not supported."));

        return Result<ITimetableImportSourceParser>.Success(parser);
    }
}