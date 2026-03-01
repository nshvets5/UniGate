using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Queries;

public sealed class EfStudentLookup : IStudentLookup
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfStudentLookup> _logger;

    public EfStudentLookup(DirectoryDbContext db, ILogger<EfStudentLookup> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<StudentRef>> FindByProfileIdAsync(Guid iamProfileId, CancellationToken ct = default)
    {
        try
        {
            var st = await _db.Students.AsNoTracking()
                .Where(x => x.IamProfileId == iamProfileId)
                .Select(x => new StudentRef(x.Id, x.GroupId, x.IamProfileId!.Value, x.IsActive))
                .FirstOrDefaultAsync(ct);

            if (st is null)
                return Result<StudentRef>.Failure(new Error("student.not_linked", "Student is not linked to this profile."));

            if (!st.IsActive)
                return Result<StudentRef>.Failure(new Error("student.inactive", "Student is inactive."));

            return Result<StudentRef>.Success(st);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to lookup student by profileId");
            return Result<StudentRef>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}