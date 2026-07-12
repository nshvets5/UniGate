using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Attempts;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Attempts;

public sealed class EfReaderScanAttemptsQueryStore
    : IReaderScanAttemptsQueryStore
{
    private readonly DevicesDbContext _db;
    private readonly ILogger<EfReaderScanAttemptsQueryStore> _logger;

    public EfReaderScanAttemptsQueryStore(
        DevicesDbContext db,
        ILogger<EfReaderScanAttemptsQueryStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<PagedResult<ReaderScanAttemptDto>>> ListAsync(
        ReaderScanAttemptsQuery query,
        CancellationToken ct = default)
    {
        try
        {
            var q = _db.ReaderScanAttempts
                .AsNoTracking()
                .AsQueryable();

            if (query.ReaderId is not null &&
                query.ReaderId != Guid.Empty)
            {
                q = q.Where(
                    x => x.ReaderId == query.ReaderId.Value);
            }

            if (query.StudentId is not null &&
                query.StudentId != Guid.Empty)
            {
                q = q.Where(
                    x => x.StudentId == query.StudentId.Value);
            }

            if (query.IsAllowed is not null)
            {
                q = q.Where(
                    x => x.IsAllowed == query.IsAllowed.Value);
            }

            if (!string.IsNullOrWhiteSpace(
                    query.CredentialType))
            {
                var credentialType = query.CredentialType
                    .Trim()
                    .ToLowerInvariant();

                q = q.Where(
                    x => x.CredentialType == credentialType);
            }

            if (!string.IsNullOrWhiteSpace(
                    query.CredentialValue))
            {
                var credentialValue =
                    query.CredentialValue.Trim();

                q = q.Where(
                    x => x.CredentialValue.Contains(
                        credentialValue));
            }

            if (query.FromUtc is not null)
            {
                q = q.Where(
                    x => x.OccurredAt >= query.FromUtc.Value);
            }

            if (query.ToUtc is not null)
            {
                q = q.Where(
                    x => x.OccurredAt <= query.ToUtc.Value);
            }

            q = q.OrderByDescending(x => x.OccurredAt);

            var total = await q.LongCountAsync(ct);

            var items = await q
                .Skip((query.Page - 1) * query.PageSize)
                .Take(query.PageSize)
                .Select(x => new ReaderScanAttemptDto(
                    x.Id,
                    x.ReaderId,
                    x.CredentialType,
                    x.CredentialValue,
                    x.CredentialId,
                    x.StudentId,
                    x.IsAllowed,
                    x.ReasonCode,
                    x.OccurredAt))
                .ToListAsync(ct);

            return Result<PagedResult<ReaderScanAttemptDto>>
                .Success(
                    new PagedResult<ReaderScanAttemptDto>(
                        items,
                        query.Page,
                        query.PageSize,
                        total));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "List reader scan attempts failed");

            return Result<PagedResult<ReaderScanAttemptDto>>
                .Failure(
                    Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<StudentAccessSummaryDto>>
        GetStudentSummaryAsync(
            Guid studentId,
            CancellationToken ct = default)
    {
        try
        {
            var q = _db.ReaderScanAttempts
                .AsNoTracking()
                .Where(x => x.StudentId == studentId);

            var total = await q.LongCountAsync(ct);

            var allowed = await q.LongCountAsync(
                x => x.IsAllowed,
                ct);

            var lastAttemptAt = await q
                .OrderByDescending(x => x.OccurredAt)
                .Select(x =>
                    (DateTimeOffset?)x.OccurredAt)
                .FirstOrDefaultAsync(ct);

            return Result<StudentAccessSummaryDto>.Success(
                new StudentAccessSummaryDto(
                    TotalAttempts: total,
                    AllowedAttempts: allowed,
                    DeniedAttempts: total - allowed,
                    LastAttemptAt: lastAttemptAt));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Get student access summary failed for " +
                "studentId={StudentId}",
                studentId);

            return Result<StudentAccessSummaryDto>.Failure(
                Errors.Infrastructure.DatabaseFailure);
        }
    }
}