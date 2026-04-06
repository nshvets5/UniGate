using System.Text.Json;
using UniGate.Audit.Domain;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Audit;

public sealed class IamUserProfileProvisionedHandler : OutboxAuditHandlerBase
{
    private readonly DirectoryStudentProfileBinder _binder;

    public IamUserProfileProvisionedHandler(
        AuditDbContext auditDb,
        DirectoryStudentProfileBinder binder) : base(auditDb)
    {
        _binder = binder;
    }

    public override bool CanHandle(string messageType)
        => messageType == "iam.user_profile_provisioned";

    public override async Task HandleAsync(OutboxMessage msg, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(msg.PayloadJson);
        var root = doc.RootElement;

        var profileId = root.GetProperty("profileId").GetGuid();
        var provider = root.GetProperty("provider").GetString();
        var subject = root.GetProperty("subject").GetString();
        var email = root.TryGetProperty("email", out var em) ? em.GetString() : null;
        var displayName = root.TryGetProperty("displayName", out var dn) ? dn.GetString() : null;

        if (await AuditAlreadyExistsAsync(msg.Id, ct))
            return;

        await SaveAuditAsync(new AuditEvent(
            type: "iam.user_profile_provisioned",
            actorProvider: provider,
            actorSubject: subject,
            actorProfileId: profileId,
            resourceType: "iam.user_profile",
            resourceId: profileId.ToString(),
            correlationId: msg.CorrelationId,
            traceId: msg.TraceId,
            ip: null,
            userAgent: null,
            dataJson: JsonSerializer.Serialize(new { email, displayName }),
            sourceMessageId: msg.Id), ct);

        if (!string.IsNullOrWhiteSpace(email))
        {
            await _binder.TryAutoBindByEmailAsync(
                profileId,
                email!,
                provider,
                subject,
                msg.CorrelationId,
                msg.TraceId,
                ct);
        }
    }
}