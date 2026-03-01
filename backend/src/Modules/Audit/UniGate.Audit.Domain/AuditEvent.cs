namespace UniGate.Audit.Domain;

public sealed class AuditEvent
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public DateTimeOffset OccurredAt { get; private set; } = DateTimeOffset.UtcNow;

    public string? ActorProvider { get; private set; }
    public string? ActorSubject { get; private set; }
    public Guid? ActorProfileId { get; private set; }

    public string Type { get; private set; } = default!;
    public string? ResourceType { get; private set; }
    public string? ResourceId { get; private set; }

    public string? CorrelationId { get; private set; }
    public string? TraceId { get; private set; }
    public string? Ip { get; private set; }
    public string? UserAgent { get; private set; }

    public string? DataJson { get; private set; }

    public Guid? SourceMessageId { get; private set; }

    private AuditEvent() { }

    public AuditEvent(
        string type,
        string? actorProvider,
        string? actorSubject,
        Guid? actorProfileId,
        string? resourceType,
        string? resourceId,
        string? correlationId,
        string? traceId,
        string? ip,
        string? userAgent,
        string? dataJson,
        Guid? sourceMessageId = null)
    {
        Type = type;
        ActorProvider = actorProvider;
        ActorSubject = actorSubject;
        ActorProfileId = actorProfileId;

        ResourceType = resourceType;
        ResourceId = resourceId;

        CorrelationId = correlationId;
        TraceId = traceId;
        Ip = ip;
        UserAgent = userAgent;

        DataJson = dataJson;
        OccurredAt = DateTimeOffset.UtcNow;
        SourceMessageId = sourceMessageId;
    }
}
