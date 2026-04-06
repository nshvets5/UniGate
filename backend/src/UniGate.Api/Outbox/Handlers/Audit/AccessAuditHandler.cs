using System.Text.Json;
using UniGate.Audit.Domain;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Audit;

public sealed class AccessAuditHandler : OutboxAuditHandlerBase
{
    public AccessAuditHandler(AuditDbContext auditDb) : base(auditDb) { }

    public override bool CanHandle(string messageType)
        => messageType.StartsWith("access.", StringComparison.Ordinal);

    public override async Task HandleAsync(OutboxMessage msg, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(msg.PayloadJson);
        var root = doc.RootElement;

        string resourceType = "access.unknown";
        string? resourceId = null;

        if (root.TryGetProperty("zoneId", out var zid))
        {
            resourceType = "access.zone";
            resourceId = zid.GetGuid().ToString();
        }
        else if (root.TryGetProperty("doorId", out var did))
        {
            resourceType = "access.door";
            resourceId = did.GetGuid().ToString();
        }
        else if (root.TryGetProperty("ruleId", out var rid))
        {
            resourceType = "access.rule";
            resourceId = rid.GetGuid().ToString();
        }

        string? actorProvider = null;
        string? actorSubject = null;

        if (root.TryGetProperty("Actor", out var actor) && actor.ValueKind == JsonValueKind.Object)
        {
            actorProvider = actor.TryGetProperty("actorProvider", out var ap) ? ap.GetString() : null;
            actorSubject = actor.TryGetProperty("actorSubject", out var asu) ? asu.GetString() : null;
        }

        if (await AuditAlreadyExistsAsync(msg.Id, ct))
            return;

        await SaveAuditAsync(new AuditEvent(
            type: msg.Type,
            actorProvider: actorProvider,
            actorSubject: actorSubject,
            actorProfileId: null,
            resourceType: resourceType,
            resourceId: resourceId,
            correlationId: msg.CorrelationId,
            traceId: msg.TraceId,
            ip: null,
            userAgent: null,
            dataJson: msg.PayloadJson,
            sourceMessageId: msg.Id), ct);
    }
}