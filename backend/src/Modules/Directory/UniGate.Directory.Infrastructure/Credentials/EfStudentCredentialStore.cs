using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Directory.Application.Credentials;
using UniGate.Directory.Domain;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Credentials;

public sealed class EfStudentCredentialStore : IStudentCredentialStore
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfStudentCredentialStore> _logger;

    public EfStudentCredentialStore(DirectoryDbContext db, ILogger<EfStudentCredentialStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> CreateAsync(CreateStudentCredentialCommand cmd, CancellationToken ct = default)
    {
        try
        {
            if (cmd.StudentId == Guid.Empty)
                return Result<Guid>.Failure(Errors.Validation.Failed("StudentId is required."));

            if (string.IsNullOrWhiteSpace(cmd.Type) || string.IsNullOrWhiteSpace(cmd.Value))
                return Result<Guid>.Failure(Errors.Validation.Failed("Type and Value are required."));

            var studentExists = await _db.Students.AsNoTracking()
                .AnyAsync(x => x.Id == cmd.StudentId, ct);

            if (!studentExists)
                return Result<Guid>.Failure(new Error("credential.student_not_found", "Student not found."));

            var type = cmd.Type.Trim().ToLowerInvariant();
            var value = cmd.Value.Trim();

            var duplicate = await _db.StudentCredentials.AsNoTracking()
                .AnyAsync(x => x.Type == type && x.Value == value, ct);

            if (duplicate)
                return Result<Guid>.Failure(new Error("credential.duplicate", "Credential already exists."));

            var entity = new StudentCredential(cmd.StudentId, type, value);

            _db.StudentCredentials.Add(entity);
            await _db.SaveChangesAsync(ct);

            return Result<Guid>.Success(entity.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Create credential failed");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<IReadOnlyList<StudentCredentialDto>>> ListByStudentAsync(Guid studentId, CancellationToken ct = default)
    {
        try
        {
            var items = await _db.StudentCredentials.AsNoTracking()
                .Where(x => x.StudentId == studentId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new StudentCredentialDto(
                    x.Id,
                    x.StudentId,
                    x.Type,
                    x.Value,
                    x.IsActive,
                    x.CreatedAt))
                .ToListAsync(ct);

            return Result<IReadOnlyList<StudentCredentialDto>>.Success(items);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "List credentials failed");
            return Result<IReadOnlyList<StudentCredentialDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> SetActiveAsync(Guid credentialId, bool isActive, CancellationToken ct = default)
    {
        try
        {
            var entity = await _db.StudentCredentials.FirstOrDefaultAsync(x => x.Id == credentialId, ct);
            if (entity is null)
                return Result.Failure(new Error("credential.not_found", "Credential not found."));

            entity.SetActive(isActive);
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Set credential active failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<ResolvedCredentialStudentDto>> ResolveAsync(string type, string value, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(type) || string.IsNullOrWhiteSpace(value))
                return Result<ResolvedCredentialStudentDto>.Failure(Errors.Validation.Failed("Type and Value are required."));

            var normalizedType = type.Trim().ToLowerInvariant();
            var normalizedValue = value.Trim();

            var item = await _db.StudentCredentials.AsNoTracking()
                .Where(c => c.Type == normalizedType && c.Value == normalizedValue)
                .Join(_db.Students.AsNoTracking(),
                    c => c.StudentId,
                    s => s.Id,
                    (c, s) => new ResolvedCredentialStudentDto(
                        c.Id,
                        s.Id,
                        s.GroupId,
                        s.Email,
                        s.IsActive,
                        c.IsActive))
                .FirstOrDefaultAsync(ct);

            return item is null
                ? Result<ResolvedCredentialStudentDto>.Failure(new Error("credential.not_found", "Credential not found."))
                : Result<ResolvedCredentialStudentDto>.Success(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Resolve credential failed");
            return Result<ResolvedCredentialStudentDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}