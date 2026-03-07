using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Import.Csv;

namespace UniGate.Timetable.Infrastructure.Import.Csv;

public sealed class CsvTimetableParser : ICsvTimetableParser
{
    public Task<Result<IReadOnlyList<ParsedCsvSlot>>> ParseAsync(
        string csvText,
        CancellationToken ct = default)
    {
        try
        {
            var rows = new List<ParsedCsvSlot>();
            var lines = csvText.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            var lineNo = 0;

            foreach (var raw in lines)
            {
                lineNo++;

                var line = raw.Trim();

                if (lineNo == 1 && line.Contains("groupId", StringComparison.OrdinalIgnoreCase))
                    continue;

                var parts = line.Split(',');

                if (parts.Length < 5)
                    return Task.FromResult(Result<IReadOnlyList<ParsedCsvSlot>>.Failure(
                        new Error("csv.invalid", $"Line {lineNo}: expected at least 5 columns.")));

                if (!Guid.TryParse(parts[0].Trim(), out var groupId))
                    return Task.FromResult(Result<IReadOnlyList<ParsedCsvSlot>>.Failure(
                        new Error("csv.invalid", $"Line {lineNo}: invalid groupId")));

                var roomCode = parts[1].Trim();

                if (!int.TryParse(parts[2].Trim(), out var dayIso) || dayIso < 1 || dayIso > 7)
                    return Task.FromResult(Result<IReadOnlyList<ParsedCsvSlot>>.Failure(
                        new Error("csv.invalid", $"Line {lineNo}: invalid dayIso")));

                if (!TimeOnly.TryParse(parts[3].Trim(), out var start))
                    return Task.FromResult(Result<IReadOnlyList<ParsedCsvSlot>>.Failure(
                        new Error("csv.invalid", $"Line {lineNo}: invalid startTime")));

                if (!TimeOnly.TryParse(parts[4].Trim(), out var end))
                    return Task.FromResult(Result<IReadOnlyList<ParsedCsvSlot>>.Failure(
                        new Error("csv.invalid", $"Line {lineNo}: invalid endTime")));

                DateTimeOffset? validFrom = null;
                DateTimeOffset? validTo = null;

                if (parts.Length > 5 && DateTimeOffset.TryParse(parts[5].Trim(), out var vf))
                    validFrom = vf;

                if (parts.Length > 6 && DateTimeOffset.TryParse(parts[6].Trim(), out var vt))
                    validTo = vt;

                var title = parts.Length > 7
                    ? string.Join(',', parts.Skip(7)).Trim()
                    : null;

                rows.Add(new ParsedCsvSlot(
                    groupId,
                    roomCode,
                    dayIso,
                    start,
                    end,
                    validFrom,
                    validTo,
                    title));
            }

            return Task.FromResult(Result<IReadOnlyList<ParsedCsvSlot>>.Success(rows));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<IReadOnlyList<ParsedCsvSlot>>.Failure(
                new Error("csv.parse_failed", ex.Message)));
        }
    }
}