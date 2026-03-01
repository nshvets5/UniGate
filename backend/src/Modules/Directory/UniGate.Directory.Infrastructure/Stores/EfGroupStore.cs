using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using UniGate.Directory.Application.Groups;
using UniGate.Directory.Domain;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Observability;
using UniGate.SharedKernel.Outbox;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Stores;

public sealed class EfGroupStore : IGroupStore
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfGroupStore> _logger;

    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;
    private readonly IRequestContext _requestContext;

    public EfGroupStore(
        DirectoryDbContext db,
        ILogger<EfGroupStore> logger,
        ICurrentUser currentUser,
        IIdentityProvider identityProvider,
        IRequestContext requestContext)
    {
        _db = db;
        _logger = logger;
        _currentUser = currentUser;
        _identityProvider = identityProvider;
        _requestContext = requestContext;
    }

    public async Task<Result<Guid>> CreateAsync(CreateGroupCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var exists = await _db.Groups.AsNoTracking().AnyAsync(x => x.Code == cmd.Code, ct);
            if (exists)
                return Result<Guid>.Failure(DirectoryErrors.Groups.DuplicateCode);

            var group = new Group(cmd.Code.Trim(), cmd.Name.Trim(), cmd.AdmissionYear);

            _db.Groups.Add(group);

            var payload = JsonSerializer.Serialize(new
            {
                groupId = group.Id,
                group.Code,
                group.Name,
                group.AdmissionYear,
                group.IsActive,
                actorProvider = _identityProvider.Name,
                actorSubject = _currentUser.Subject,
                occurredAt = DateTimeOffset.UtcNow
            });

            _db.OutboxMessages.Add(new OutboxMessage(
                type: DirectoryOutboxTypes.GroupCreated,
                payloadJson: payload,
                correlationId: _requestContext.CorrelationId,
                traceId: _requestContext.TraceId));

            await _db.SaveChangesAsync(ct);

            return Result<Guid>.Success(group.Id);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "DbUpdateException while creating group code={Code}", cmd.Code);
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while creating group code={Code}", cmd.Code);
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PagedResult<GroupDto>>> ListAsync(ListGroupsQuery query, CancellationToken ct = default)
    {
        try
        {
            var q = _db.Groups.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.Trim();
                q = q.Where(x => x.Code.Contains(s) || x.Name.Contains(s));
            }

            if (query.IsActive is not null)
                q = q.Where(x => x.IsActive == query.IsActive.Value);

            q = q.OrderBy(x => x.AdmissionYear).ThenBy(x => x.Code);

            var total = await q.LongCountAsync(ct);
            var skip = (query.Page - 1) * query.PageSize;

            var items = await q.Skip(skip).Take(query.PageSize)
                .Select(x => new GroupDto(x.Id, x.Code, x.Name, x.AdmissionYear, x.IsActive, x.CreatedAt))
                .ToListAsync(ct);

            return Result<PagedResult<GroupDto>>.Success(new PagedResult<GroupDto>(items, query.Page, query.PageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list groups");
            return Result<PagedResult<GroupDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<GroupDto>> GetByIdAsync(GetGroupByIdQuery query, CancellationToken ct = default)
    {
        try
        {
            var g = await _db.Groups.AsNoTracking()
                .Where(x => x.Id == query.Id)
                .Select(x => new GroupDto(x.Id, x.Code, x.Name, x.AdmissionYear, x.IsActive, x.CreatedAt))
                .FirstOrDefaultAsync(ct);

            return g is null
                ? Result<GroupDto>.Failure(DirectoryErrors.Groups.NotFound)
                : Result<GroupDto>.Success(g);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get group id={Id}", query.Id);
            return Result<GroupDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> UpdateAsync(UpdateGroupCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var group = await _db.Groups.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (group is null)
                return Result.Failure(DirectoryErrors.Groups.NotFound);

            var newCode = cmd.Code.Trim();
            if (!string.Equals(group.Code, newCode, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _db.Groups.AsNoTracking().AnyAsync(x => x.Code == newCode && x.Id != cmd.Id, ct);
                if (exists)
                    return Result.Failure(DirectoryErrors.Groups.DuplicateCode);

                group.ChangeCode(newCode);
            }

            group.Rename(cmd.Name.Trim());
            group.SetAdmissionYear(cmd.AdmissionYear);

            var payload = JsonSerializer.Serialize(new
            {
                groupId = group.Id,
                group.Code,
                group.Name,
                group.AdmissionYear,
                group.IsActive,
                actorProvider = _identityProvider.Name,
                actorSubject = _currentUser.Subject,
                occurredAt = DateTimeOffset.UtcNow
            });

            _db.OutboxMessages.Add(new OutboxMessage(
                type: DirectoryOutboxTypes.GroupUpdated,
                payloadJson: payload,
                correlationId: _requestContext.CorrelationId,
                traceId: _requestContext.TraceId));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "DbUpdateException while updating group id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating group id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> SetActiveAsync(SetGroupActiveCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var group = await _db.Groups.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (group is null)
                return Result.Failure(DirectoryErrors.Groups.NotFound);

            group.SetActive(cmd.IsActive);

            var payload = JsonSerializer.Serialize(new
            {
                groupId = group.Id,
                group.Code,
                group.Name,
                group.AdmissionYear,
                group.IsActive,
                actorProvider = _identityProvider.Name,
                actorSubject = _currentUser.Subject,
                occurredAt = DateTimeOffset.UtcNow
            });

            _db.OutboxMessages.Add(new OutboxMessage(
                type: DirectoryOutboxTypes.GroupActiveChanged,
                payloadJson: payload,
                correlationId: _requestContext.CorrelationId,
                traceId: _requestContext.TraceId));

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "DbUpdateException while setting group active id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while setting group active id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}