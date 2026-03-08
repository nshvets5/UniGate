using UniGate.SharedKernel.Files;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Import;

namespace UniGate.Timetable.Infrastructure.Import.Csv;

public sealed class CsvTimetableSourceParser : ITimetableImportSourceParser
{
    private readonly ITextFileReader _fileReader;

    public CsvTimetableSourceParser(ITextFileReader fileReader)
    {
        _fileReader = fileReader;
    }

    public string SourceType => "csv";

    public async Task<Result<TimetableParseResult>> ParseAsync(
        TimetableParseRequest request,
        CancellationToken ct = default)
    {
        var textRes = await _fileReader.ReadAllTextAsync(request.FileStream, ct);
        if (!textRes.IsSuccess)
            return Result<TimetableParseResult>.Failure(textRes.Error);

        try
        {
            var rows = new List<RawParsedSlot>();
            var issues = new List<ImportIssue>();

            var lines = textRes.Value.Split('\n', StringSplitOptions.RemoveEmptyEntries);
            var lineNo = 0;

            foreach (var raw in lines)
            {
                lineNo++;
                var line = raw.Trim();

                if (string.IsNullOrWhiteSpace(line))
                    continue;

                if (lineNo == 1 && line.Contains("groupId", StringComparison.OrdinalIgnoreCase))
                    continue;

                var parts = line.Split(',');

                if (parts.Length < 5)
                {
                    issues.Add(new ImportIssue(lineNo, "csv.invalid", "Expected at least 5 columns."));
                    continue;
                }

                if (!Guid.TryParse(parts[0].Trim(), out var groupId))
                {
                    issues.Add(new ImportIssue(lineNo, "csv.invalid_group_id", "Invalid groupId."));
                    continue;
                }

                var roomCode = parts[1].Trim();
                if (string.IsNullOrWhiteSpace(roomCode))
                {
                    issues.Add(new ImportIssue(lineNo, "csv.invalid_room_code", "RoomCode is required."));
                    continue;
                }

                if (!int.TryParse(parts[2].Trim(), out var dayIso) || dayIso < 1 || dayIso > 7)
                {
                    issues.Add(new ImportIssue(lineNo, "csv.invalid_day", "DayOfWeekIso must be 1..7."));
                    continue;
                }

                if (!TimeOnly.TryParse(parts[3].Trim(), out var start))
                {
                    issues.Add(new ImportIssue(lineNo, "csv.invalid_start", "Invalid startTime."));
                    continue;
                }

                if (!TimeOnly.TryParse(parts[4].Trim(), out var end))
                {
                    issues.Add(new ImportIssue(lineNo, "csv.invalid_end", "Invalid endTime."));
                    continue;
                }

                if (start == end)
                {
                    issues.Add(new ImportIssue(lineNo, "csv.zero_duration", "StartTime and EndTime cannot be equal."));
                    continue;
                }

                DateTimeOffset? validFrom = null;
                DateTimeOffset? validTo = null;

                if (parts.Length > 5 && !string.IsNullOrWhiteSpace(parts[5]))
                {
                    if (DateTimeOffset.TryParse(parts[5].Trim(), out var vf))
                        validFrom = vf;
                    else
                    {
                        issues.Add(new ImportIssue(lineNo, "csv.invalid_valid_from", "Invalid validFrom."));
                        continue;
                    }
                }

                if (parts.Length > 6 && !string.IsNullOrWhiteSpace(parts[6]))
                {
                    if (DateTimeOffset.TryParse(parts[6].Trim(), out var vt))
                        validTo = vt;
                    else
                    {
                        issues.Add(new ImportIssue(lineNo, "csv.invalid_valid_to", "Invalid validTo."));
                        continue;
                    }
                }

                if (validFrom is not null && validTo is not null && validTo < validFrom)
                {
                    issues.Add(new ImportIssue(lineNo, "csv.invalid_validity", "ValidTo must be >= ValidFrom."));
                    continue;
                }

                var title = parts.Length > 7
                    ? string.Join(',', parts.Skip(7)).Trim()
                    : null;

                rows.Add(new RawParsedSlot(
                    SequenceNumber: lineNo,
                    GroupId: groupId,
                    RoomCode: roomCode,
                    DayOfWeekIso: dayIso,
                    StartTime: start,
                    EndTime: end,
                    ValidFrom: validFrom,
                    ValidTo: validTo,
                    Title: title));
            }

            return Result<TimetableParseResult>.Success(
                new TimetableParseResult(SourceType, rows, issues));
        }
        catch (Exception ex)
        {
            return Result<TimetableParseResult>.Failure(
                new Error("csv.parse_failed", ex.Message));
        }
    }
}