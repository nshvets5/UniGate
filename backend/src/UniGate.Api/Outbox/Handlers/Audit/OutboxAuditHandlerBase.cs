using Microsoft.EntityFrameworkCore;
using UniGate.Audit.Domain;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox.Handlers.Audit;

public abstract class OutboxAuditHandlerBase : IOutboxMessageHandler
{
    protected readonly AuditDbContext AuditDb;

    protected OutboxAuditHandlerBase(AuditDbContext auditDb)
    {
        AuditDb = auditDb;
    }

    public abstract bool CanHandle(string messageType);

    public abstract Task HandleAsync(OutboxMessage message, CancellationToken ct);

    protected async Task<bool> AuditAlreadyExistsAsync(Guid sourceMessageId, CancellationToken ct)
        => await AuditDb.AuditEvents.AsNoTracking()
            .AnyAsync(x => x.SourceMessageId == sourceMessageId, ct);

    protected async Task SaveAuditAsync(AuditEvent auditEvent, CancellationToken ct)
    {
        AuditDb.AuditEvents.Add(auditEvent);
        await AuditDb.SaveChangesAsync(ct);
    }
}