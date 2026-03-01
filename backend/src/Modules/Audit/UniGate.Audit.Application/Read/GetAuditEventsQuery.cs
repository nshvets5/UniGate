namespace UniGate.Audit.Application.Read;

public sealed record GetAuditEventsQuery(
    DateTimeOffset? From,
    DateTimeOffset? To,
    string? Type,
    string? ActorSubject,
    Guid? ActorProfileId,
    string? CorrelationId,
    int Page,
    int PageSize);