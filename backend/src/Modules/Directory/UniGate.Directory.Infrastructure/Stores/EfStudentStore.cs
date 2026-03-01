using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Directory.Application.Students;
using UniGate.Directory.Domain;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Observability;
using UniGate.SharedKernel.Outbox;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Stores;

public sealed class EfStudentStore : IStudentStore
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfStudentStore> _logger;
    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;
    private readonly IRequestContext _requestContext;

    public EfStudentStore(
        DirectoryDbContext db,
        ILogger<EfStudentStore> logger,
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

    public async Task<Result<Guid>> CreateAsync(CreateStudentCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var groupExists = await _db.Groups.AsNoTracking().AnyAsync(x => x.Id == cmd.GroupId, ct);
            if (!groupExists)
                return Result<Guid>.Failure(DirectoryStudentErrors.GroupNotFound);

            var email = cmd.Email.Trim().ToLowerInvariant();

            var exists = await _db.Students.AsNoTracking().AnyAsync(x => x.Email == email, ct);
            if (exists)
                return Result<Guid>.Failure(DirectoryStudentErrors.DuplicateEmail);

            var st = new Student(
                cmd.GroupId,
                cmd.FirstName.Trim(),
                cmd.LastName.Trim(),
                string.IsNullOrWhiteSpace(cmd.MiddleName) ? null : cmd.MiddleName.Trim(),
                email);

            _db.Students.Add(st);

            _db.OutboxMessages.Add(new OutboxMessage(
                type: DirectoryOutboxTypes.StudentCreated,
                payloadJson: BuildPayload(st),
                correlationId: _requestContext.CorrelationId,
                traceId: _requestContext.TraceId));

            await _db.SaveChangesAsync(ct);
            return Result<Guid>.Success(st.Id);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "DbUpdateException while creating student email={Email}", cmd.Email);
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while creating student email={Email}", cmd.Email);
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PagedResult<StudentDto>>> ListAsync(ListStudentsQuery query, CancellationToken ct = default)
    {
        try
        {
            var q = _db.Students.AsNoTracking().AsQueryable();

            if (query.GroupId is not null)
                q = q.Where(x => x.GroupId == query.GroupId.Value);

            if (query.IsActive is not null)
                q = q.Where(x => x.IsActive == query.IsActive.Value);

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.Trim().ToLowerInvariant();
                q = q.Where(x =>
                    x.Email.Contains(s) ||
                    (x.FirstName + " " + x.LastName).ToLower().Contains(s) ||
                    x.LastName.ToLower().Contains(s));
            }

            q = q.OrderBy(x => x.LastName).ThenBy(x => x.FirstName);

            var total = await q.LongCountAsync(ct);
            var skip = (query.Page - 1) * query.PageSize;

            var items = await q.Skip(skip).Take(query.PageSize)
                .Select(x => new StudentDto(
                    x.Id, x.GroupId, x.FirstName, x.LastName, x.MiddleName,
                    x.Email, x.IamProfileId, x.IsActive, x.CreatedAt))
                .ToListAsync(ct);

            return Result<PagedResult<StudentDto>>.Success(new PagedResult<StudentDto>(items, query.Page, query.PageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to list students");
            return Result<PagedResult<StudentDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<StudentDto>> GetByIdAsync(GetStudentByIdQuery query, CancellationToken ct = default)
    {
        try
        {
            var st = await _db.Students.AsNoTracking()
                .Where(x => x.Id == query.Id)
                .Select(x => new StudentDto(
                    x.Id, x.GroupId, x.FirstName, x.LastName, x.MiddleName,
                    x.Email, x.IamProfileId, x.IsActive, x.CreatedAt))
                .FirstOrDefaultAsync(ct);

            return st is null
                ? Result<StudentDto>.Failure(DirectoryStudentErrors.NotFound)
                : Result<StudentDto>.Success(st);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get student id={Id}", query.Id);
            return Result<StudentDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> UpdateAsync(UpdateStudentCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var st = await _db.Students.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (st is null)
                return Result.Failure(DirectoryStudentErrors.NotFound);

            var email = cmd.Email.Trim().ToLowerInvariant();
            if (!string.Equals(st.Email, email, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _db.Students.AsNoTracking().AnyAsync(x => x.Email == email && x.Id != cmd.Id, ct);
                if (exists)
                    return Result.Failure(DirectoryStudentErrors.DuplicateEmail);

                st.ChangeEmail(email);
            }

            st.Rename(cmd.FirstName.Trim(), cmd.LastName.Trim(), string.IsNullOrWhiteSpace(cmd.MiddleName) ? null : cmd.MiddleName.Trim());

            _db.OutboxMessages.Add(new OutboxMessage(
                type: DirectoryOutboxTypes.StudentUpdated,
                payloadJson: BuildPayload(st),
                correlationId: _requestContext.CorrelationId,
                traceId: _requestContext.TraceId));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "DbUpdateException while updating student id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while updating student id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> SetActiveAsync(SetStudentActiveCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var st = await _db.Students.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (st is null)
                return Result.Failure(DirectoryStudentErrors.NotFound);

            st.SetActive(cmd.IsActive);

            _db.OutboxMessages.Add(new OutboxMessage(
                type: DirectoryOutboxTypes.StudentActiveChanged,
                payloadJson: BuildPayload(st),
                correlationId: _requestContext.CorrelationId,
                traceId: _requestContext.TraceId));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to set student active id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> ChangeGroupAsync(ChangeStudentGroupCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var st = await _db.Students.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (st is null)
                return Result.Failure(DirectoryStudentErrors.NotFound);

            var groupExists = await _db.Groups.AsNoTracking().AnyAsync(x => x.Id == cmd.GroupId, ct);
            if (!groupExists)
                return Result.Failure(DirectoryStudentErrors.GroupNotFound);

            st.ChangeGroup(cmd.GroupId);

            _db.OutboxMessages.Add(new OutboxMessage(
                type: DirectoryOutboxTypes.StudentGroupChanged,
                payloadJson: BuildPayload(st),
                correlationId: _requestContext.CorrelationId,
                traceId: _requestContext.TraceId));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to change student group id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> BindProfileAsync(BindStudentProfileCommand cmd, CancellationToken ct = default)
    {
        try
        {
            var st = await _db.Students.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (st is null)
                return Result.Failure(DirectoryStudentErrors.NotFound);

            st.BindIamProfile(cmd.IamProfileId);

            _db.OutboxMessages.Add(new OutboxMessage(
                type: DirectoryOutboxTypes.StudentProfileBound,
                payloadJson: BuildPayload(st),
                correlationId: _requestContext.CorrelationId,
                traceId: _requestContext.TraceId));

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to bind student profile id={Id}", cmd.Id);
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    private string BuildPayload(Student st)
    {
        return JsonSerializer.Serialize(new
        {
            studentId = st.Id,
            st.GroupId,
            st.FirstName,
            st.LastName,
            st.MiddleName,
            st.Email,
            st.IamProfileId,
            st.IsActive,
            actorProvider = _identityProvider.Name,
            actorSubject = _currentUser.Subject,
            occurredAt = DateTimeOffset.UtcNow
        });
    }
}