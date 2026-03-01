using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Audit.Application.Read;
using UniGate.Audit.Infrastructure.Persistence;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Audit.Infrastructure.Read;

public sealed class EfAuditQuery : IAuditQuery
{
    private readonly AuditDbContext _db;
    private readonly ILogger<EfAuditQuery> _logger;

    public EfAuditQuery(AuditDbContext db, ILogger<EfAuditQuery> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<PagedResult<AuditEventDto>>> GetEventsAsync(GetAuditEventsQuery query, CancellationToken ct = default)
    {
        try
        {
            if (query.Page < 1)
                return Result<PagedResult<AuditEventDto>>.Failure(Errors.Validation.Failed("Page must be >= 1."));
            if (query.PageSize is < 1 or > 200)
                return Result<PagedResult<AuditEventDto>>.Failure(Errors.Validation.Failed("PageSize must be between 1 and 200."));

            var q = _db.AuditEvents.AsNoTracking().AsQueryable();

            if (query.From is not null)
                q = q.Where(x => x.OccurredAt >= query.From.Value);

            if (query.To is not null)
                q = q.Where(x => x.OccurredAt <= query.To.Value);

            if (!string.IsNullOrWhiteSpace(query.Type))
                q = q.Where(x => x.Type == query.Type);

            if (!string.IsNullOrWhiteSpace(query.ActorSubject))
                q = q.Where(x => x.ActorSubject == query.ActorSubject);

            if (query.ActorProfileId is not null)
                q = q.Where(x => x.ActorProfileId == query.ActorProfileId);

            if (!string.IsNullOrWhiteSpace(query.CorrelationId))
                q = q.Where(x => x.CorrelationId == query.CorrelationId);

            q = q.OrderByDescending(x => x.OccurredAt).ThenByDescending(x => x.Id);

            var total = await q.LongCountAsync(ct);

            var skip = (query.Page - 1) * query.PageSize;

            var items = await q
                .Skip(skip)
                .Take(query.PageSize)
                .Select(x => new AuditEventDto(
                    x.Id,
                    x.OccurredAt,
                    x.Type,
                    x.ActorProvider,
                    x.ActorSubject,
                    x.ActorProfileId,
                    x.ResourceType,
                    x.ResourceId,
                    x.CorrelationId,
                    x.TraceId,
                    x.Ip,
                    x.UserAgent,
                    x.DataJson,
                    x.SourceMessageId))
                .ToListAsync(ct);

            return Result<PagedResult<AuditEventDto>>.Success(
                new PagedResult<AuditEventDto>(items, query.Page, query.PageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to query audit events");
            return Result<PagedResult<AuditEventDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}