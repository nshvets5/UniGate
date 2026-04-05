using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Queries;

public sealed class EfStudentCredentialLookup : IStudentCredentialLookup
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfStudentCredentialLookup> _logger;

    public EfStudentCredentialLookup(DirectoryDbContext db, ILogger<EfStudentCredentialLookup> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<StudentCredentialRef>> ResolveAsync(string type, string value, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(type) || string.IsNullOrWhiteSpace(value))
                return Result<StudentCredentialRef>.Failure(
                    Errors.Validation.Failed("Type and Value are required."));

            var normalizedType = type.Trim().ToLowerInvariant();
            var normalizedValue = value.Trim();

            var item = await _db.StudentCredentials.AsNoTracking()
                .Where(c => c.Type == normalizedType && c.Value == normalizedValue)
                .Join(
                    _db.Students.AsNoTracking(),
                    c => c.StudentId,
                    s => s.Id,
                    (c, s) => new StudentCredentialRef(
                        c.Id,
                        s.Id,
                        s.GroupId,
                        s.IsActive,
                        c.IsActive))
                .FirstOrDefaultAsync(ct);

            return item is null
                ? Result<StudentCredentialRef>.Failure(new Error("credential.not_found", "Credential not found."))
                : Result<StudentCredentialRef>.Success(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Resolve student credential lookup failed");
            return Result<StudentCredentialRef>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}