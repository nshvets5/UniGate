using System.Text.Json;
using UniGate.Audit.Domain;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Audit;

public sealed class DirectoryGroupAuditHandler : OutboxAuditHandlerBase
{
    public DirectoryGroupAuditHandler(AuditDbContext auditDb) : base(auditDb) { }

    public override bool CanHandle(string messageType)
        => messageType is "directory.group_created" or "directory.group_updated" or "directory.group_active_changed";

    public override async Task HandleAsync(OutboxMessage msg, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(msg.PayloadJson);
        var root = doc.RootElement;

        var groupId = root.GetProperty("groupId").GetGuid();
        var code = root.GetProperty("Code").GetString();
        var name = root.GetProperty("Name").GetString();
        var admissionYear = root.GetProperty("AdmissionYear").GetInt32();
        var isActive = root.GetProperty("IsActive").GetBoolean();

        var actorProvider = root.TryGetProperty("actorProvider", out var ap) ? ap.GetString() : null;
        var actorSubject = root.TryGetProperty("actorSubject", out var asu) ? asu.GetString() : null;

        if (await AuditAlreadyExistsAsync(msg.Id, ct))
            return;

        await SaveAuditAsync(new AuditEvent(
            type: msg.Type,
            actorProvider: actorProvider,
            actorSubject: actorSubject,
            actorProfileId: null,
            resourceType: "directory.group",
            resourceId: groupId.ToString(),
            correlationId: msg.CorrelationId,
            traceId: msg.TraceId,
            ip: null,
            userAgent: null,
            dataJson: JsonSerializer.Serialize(new { groupId, code, name, admissionYear, isActive }),
            sourceMessageId: msg.Id), ct);
    }
}