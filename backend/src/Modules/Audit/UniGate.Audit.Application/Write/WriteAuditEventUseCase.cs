using UniGate.Audit.Domain;
using UniGate.SharedKernel.Results;

namespace UniGate.Audit.Application.Write;

public sealed class WriteAuditEventUseCase
{
    private readonly IAuditStore _store;

    public WriteAuditEventUseCase(IAuditStore store)
    {
        _store = store;
    }

    public Task<Result<Guid>> ExecuteAsync(WriteAuditEventCommand cmd, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(cmd.Type))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Audit event type is required.")));

        var ev = new AuditEvent(
            type: cmd.Type,
            actorProvider: cmd.ActorProvider,
            actorSubject: cmd.ActorSubject,
            actorProfileId: cmd.ActorProfileId,
            resourceType: cmd.ResourceType,
            resourceId: cmd.ResourceId,
            correlationId: cmd.CorrelationId,
            traceId: cmd.TraceId,
            ip: cmd.Ip,
            userAgent: cmd.UserAgent,
            dataJson: cmd.DataJson);

        return _store.WriteAsync(ev, ct);
    }
}
