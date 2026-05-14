using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Queries;

public sealed class EfStudentGroupLookup : IStudentGroupLookup
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfStudentGroupLookup> _logger;

    public EfStudentGroupLookup(
        DirectoryDbContext db,
        ILogger<EfStudentGroupLookup> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> GetGroupIdByStudentIdAsync(Guid studentId, CancellationToken ct = default)
    {
        try
        {
            if (studentId == Guid.Empty)
                return Result<Guid>.Failure(Errors.Validation.Failed("StudentId is required."));

            var groupId = await _db.Students.AsNoTracking()
                .Where(x => x.Id == studentId && x.IsActive)
                .Select(x => (Guid?)x.GroupId)
                .FirstOrDefaultAsync(ct);

            return groupId is null
                ? Result<Guid>.Failure(new Error("directory.student_not_found", "Active student not found."))
                : Result<Guid>.Success(groupId.Value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Student group lookup failed");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}