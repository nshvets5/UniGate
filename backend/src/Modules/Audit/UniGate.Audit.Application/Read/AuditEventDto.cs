namespace UniGate.Audit.Application.Read;

public sealed record AuditEventDto(
    Guid Id,
    DateTimeOffset OccurredAt,
    string Type,
    string? ActorProvider,
    string? ActorSubject,
    Guid? ActorProfileId,
    string? ResourceType,
    string? ResourceId,
    string? CorrelationId,
    string? TraceId,
    string? Ip,
    string? UserAgent,
    string? DataJson,
    Guid? SourceMessageId);