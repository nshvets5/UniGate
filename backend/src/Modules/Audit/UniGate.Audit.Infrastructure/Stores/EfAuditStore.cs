using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Audit.Application;
using UniGate.Audit.Domain;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.SharedKernel.Results;

namespace UniGate.Audit.Infrastructure.Stores;

public sealed class EfAuditStore : IAuditStore
{
    private readonly AuditDbContext _db;
    private readonly ILogger<EfAuditStore> _logger;

    public EfAuditStore(AuditDbContext db, ILogger<EfAuditStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> WriteAsync(AuditEvent auditEvent, CancellationToken ct = default)
    {
        try
        {
            _db.AuditEvents.Add(auditEvent);
            await _db.SaveChangesAsync(ct);
            return Result<Guid>.Success(auditEvent.Id);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "DbUpdateException while writing audit event type={Type}", auditEvent.Type);
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while writing audit event type={Type}", auditEvent.Type);
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}
