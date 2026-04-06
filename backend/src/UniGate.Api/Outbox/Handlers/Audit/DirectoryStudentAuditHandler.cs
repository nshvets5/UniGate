using System.Text.Json;
using UniGate.Audit.Domain;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Audit;

public sealed class DirectoryStudentAuditHandler : OutboxAuditHandlerBase
{
    private readonly DirectoryStudentProfileBinder _binder;

    public DirectoryStudentAuditHandler(
        AuditDbContext auditDb,
        DirectoryStudentProfileBinder binder) : base(auditDb)
    {
        _binder = binder;
    }

    public override bool CanHandle(string messageType)
        => messageType.StartsWith("directory.student_", StringComparison.Ordinal);

    public override async Task HandleAsync(OutboxMessage msg, CancellationToken ct)
    {
        if (msg.Type is DirectoryOutboxTypes.StudentCreated or DirectoryOutboxTypes.StudentUpdated)
            await _binder.TryBindForStudentEventAsync(msg, ct);

        using var doc = JsonDocument.Parse(msg.PayloadJson);
        var root = doc.RootElement;

        var studentId = root.GetProperty("studentId").GetGuid();
        var groupId = root.GetProperty("GroupId").GetGuid();

        var firstName = root.GetProperty("FirstName").GetString();
        var lastName = root.GetProperty("LastName").GetString();
        var email = root.GetProperty("Email").GetString();
        var isActive = root.GetProperty("IsActive").GetBoolean();

        var iamProfileId = root.TryGetProperty("IamProfileId", out var p) && p.ValueKind != JsonValueKind.Null
            ? p.GetGuid()
            : (Guid?)null;

        var actorProvider = root.TryGetProperty("actorProvider", out var ap) ? ap.GetString() : null;
        var actorSubject = root.TryGetProperty("actorSubject", out var asu) ? asu.GetString() : null;

        if (await AuditAlreadyExistsAsync(msg.Id, ct))
            return;

        await SaveAuditAsync(new AuditEvent(
            type: msg.Type,
            actorProvider: actorProvider,
            actorSubject: actorSubject,
            actorProfileId: null,
            resourceType: "directory.student",
            resourceId: studentId.ToString(),
            correlationId: msg.CorrelationId,
            traceId: msg.TraceId,
            ip: null,
            userAgent: null,
            dataJson: JsonSerializer.Serialize(new { studentId, groupId, firstName, lastName, email, isActive, iamProfileId }),
            sourceMessageId: msg.Id), ct);
    }
}