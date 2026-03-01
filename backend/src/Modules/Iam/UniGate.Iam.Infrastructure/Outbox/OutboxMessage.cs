namespace UniGate.Iam.Infrastructure.Outbox;

public sealed class OutboxMessage
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public DateTimeOffset OccurredAt { get; private set; } = DateTimeOffset.UtcNow;

    public string Type { get; private set; } = default!;
    public string PayloadJson { get; private set; } = default!;

    public string? CorrelationId { get; private set; }
    public string? TraceId { get; private set; }

    public int Attempts { get; private set; }
    public string? LastError { get; private set; }

    public DateTimeOffset AvailableAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ProcessedAt { get; private set; }

    private OutboxMessage() { }

    public OutboxMessage(
        string type,
        string payloadJson,
        string? correlationId,
        string? traceId)
    {
        Type = type;
        PayloadJson = payloadJson;
        CorrelationId = correlationId;
        TraceId = traceId;
        OccurredAt = DateTimeOffset.UtcNow;
        AvailableAt = DateTimeOffset.UtcNow;
    }

    public void MarkProcessed() => ProcessedAt = DateTimeOffset.UtcNow;

    public void MarkFailed(string error, TimeSpan retryDelay)
    {
        Attempts += 1;
        LastError = error;
        AvailableAt = DateTimeOffset.UtcNow.Add(retryDelay);
    }
}
