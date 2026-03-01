using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Audit.Application.Read;

public interface IAuditQuery
{
    Task<Result<PagedResult<AuditEventDto>>> GetEventsAsync(GetAuditEventsQuery query, CancellationToken ct = default);
}