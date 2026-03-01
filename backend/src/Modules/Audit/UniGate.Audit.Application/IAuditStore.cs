using UniGate.SharedKernel.Results;

namespace UniGate.Audit.Application;

public interface IAuditStore
{
    Task<Result<Guid>> WriteAsync(Domain.AuditEvent auditEvent, CancellationToken ct = default);
}
