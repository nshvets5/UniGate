namespace UniGate.Audit.Application.Write;

public sealed record WriteAuditEventCommand(
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
    string? DataJson);
