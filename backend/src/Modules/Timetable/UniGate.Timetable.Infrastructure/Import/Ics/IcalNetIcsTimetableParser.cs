using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Import;
using UniGate.Timetable.Application.Import.Ics;

namespace UniGate.Timetable.Infrastructure.Import.Ics;

public sealed class IcalNetIcsTimetableParser : IIcsTimetableParser
{
    public Task<Result<IcsParseResult>> ParseAsync(
        string icsText,
        DateOnly fromDate,
        int rangeDays,
        string timeZoneId,
        CancellationToken ct = default)
    {
        try
        {
            Calendar calendar;
            try
            {
                calendar = Calendar.Load(icsText);
            }
            catch (Exception ex)
            {
                return Task.FromResult(Result<IcsParseResult>.Failure(
                    new Error("timetable.ics_invalid", $"ICS parse error: {ex.Message}")));
            }

            TimeZoneInfo tz;
            try { tz = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId); }
            catch { tz = TimeZoneInfo.Utc; }

            var fromLocal = new DateTime(fromDate.Year, fromDate.Month, fromDate.Day, 0, 0, 0, DateTimeKind.Unspecified);
            var toLocal = fromLocal.AddDays(rangeDays);

            var rows = new List<ParsedIcsSlot>();
            var issues = new List<ImportIssue>();
            var seq = 0;

            foreach (var ev in calendar.Events ?? Enumerable.Empty<CalendarEvent>())
            {
                if (ev?.DtStart is null || ev.DtEnd is null)
                {
                    seq++;
                    issues.Add(new ImportIssue(seq, "ics.invalid_event", "Event has no DTSTART/DTEND."));
                    continue;
                }

                var roomCode = ExtractRoomCode(ev.Location);
                var title = string.IsNullOrWhiteSpace(ev.Summary) ? null : ev.Summary.Trim();

                IEnumerable<Occurrence> occurrences;
                try
                {
                    var fromCal = new CalDateTime(fromLocal, timeZoneId);
                    var toCal = new CalDateTime(toLocal, timeZoneId);

                    occurrences = ev
                        .GetOccurrences(fromCal)
                        .Where(o =>
                            o.Period?.StartTime is not null &&
                            o.Period.StartTime.Value < toCal.Value);
                }
                catch
                {
                    occurrences = new[] { new Occurrence(ev, new Period(ev.DtStart, ev.DtEnd)) };
                }

                foreach (var occ in occurrences)
                {
                    seq++;

                    var period = occ.Period;
                    if (period is null)
                    {
                        issues.Add(new ImportIssue(seq, "ics.invalid_period", "Occurrence has no period."));
                        continue;
                    }

                    var start = period.StartTime?.Value;
                    var end = period.EndTime?.Value;
                    if (start is null || end is null)
                    {
                        issues.Add(new ImportIssue(seq, "ics.invalid_time", "Occurrence has invalid start/end."));
                        continue;
                    }

                    var startUtc = new DateTimeOffset(DateTime.SpecifyKind(start.Value, DateTimeKind.Local)).ToUniversalTime();
                    var endUtc = new DateTimeOffset(DateTime.SpecifyKind(end.Value, DateTimeKind.Local)).ToUniversalTime();

                    var startSchool = TimeZoneInfo.ConvertTime(startUtc, tz);
                    var endSchool = TimeZoneInfo.ConvertTime(endUtc, tz);

                    var dayIso = startSchool.DayOfWeek switch
                    {
                        DayOfWeek.Monday => 1,
                        DayOfWeek.Tuesday => 2,
                        DayOfWeek.Wednesday => 3,
                        DayOfWeek.Thursday => 4,
                        DayOfWeek.Friday => 5,
                        DayOfWeek.Saturday => 6,
                        DayOfWeek.Sunday => 7,
                        _ => 0
                    };

                    if (dayIso == 0)
                    {
                        issues.Add(new ImportIssue(seq, "ics.invalid_day", "Cannot map day of week."));
                        continue;
                    }

                    var startTime = TimeOnly.FromDateTime(startSchool.DateTime);
                    var endTime = TimeOnly.FromDateTime(endSchool.DateTime);

                    if (startTime == endTime)
                    {
                        issues.Add(new ImportIssue(seq, "ics.zero_duration", "StartTime and EndTime cannot be equal."));
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(roomCode))
                    {
                        issues.Add(new ImportIssue(seq, "ics.missing_location", $"Event '{title ?? "(no title)"}' has empty LOCATION."));
                        continue;
                    }

                    rows.Add(new ParsedIcsSlot(
                        seq,
                        roomCode,
                        dayIso,
                        startTime,
                        endTime,
                        title));
                }
            }

            return Task.FromResult(Result<IcsParseResult>.Success(new IcsParseResult(rows, issues)));
        }
        catch (Exception ex)
        {
            return Task.FromResult(Result<IcsParseResult>.Failure(
                new Error("timetable.ics_parse_failed", ex.Message)));
        }
    }

    private static string? ExtractRoomCode(string? location)
    {
        if (string.IsNullOrWhiteSpace(location))
            return null;

        var raw = location.Trim();
        var first = raw.Split(new[] { ',', ';' }, 2)[0].Trim();
        var code = first.Split(' ', 2, StringSplitOptions.RemoveEmptyEntries)[0].Trim();
        return string.IsNullOrWhiteSpace(code) ? null : code;
    }
}