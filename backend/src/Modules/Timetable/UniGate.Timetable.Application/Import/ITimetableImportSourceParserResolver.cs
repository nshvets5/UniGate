using UniGate.SharedKernel.Results;

namespace UniGate.Timetable.Application.Import;

public interface ITimetableImportSourceParserResolver
{
    Result<ITimetableImportSourceParser> Resolve(string sourceType);
}