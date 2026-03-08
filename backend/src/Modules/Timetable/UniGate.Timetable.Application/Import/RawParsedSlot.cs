namespace UniGate.Timetable.Application.Import;

public sealed record RawParsedSlot(
    int SequenceNumber,
    Guid? GroupId,
    string RoomCode,
    int DayOfWeekIso,
    TimeOnly StartTime,
    TimeOnly EndTime,
    DateTimeOffset? ValidFrom,
    DateTimeOffset? ValidTo,
    string? Title);