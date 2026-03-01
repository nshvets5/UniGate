using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Directory.Application.Me;
using UniGate.Directory.Application.Students;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Infrastructure.Queries;

public sealed class EfMyDirectoryQuery : IMyDirectoryQuery
{
    private readonly DirectoryDbContext _db;
    private readonly ILogger<EfMyDirectoryQuery> _logger;

    public EfMyDirectoryQuery(DirectoryDbContext db, ILogger<EfMyDirectoryQuery> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<StudentDto>> GetStudentByProfileIdAsync(GetMyStudentQuery query, CancellationToken ct = default)
    {
        try
        {
            var st = await _db.Students.AsNoTracking()
                .Where(x => x.IamProfileId == query.IamProfileId && x.IsActive)
                .Select(x => new StudentDto(
                    x.Id, x.GroupId, x.FirstName, x.LastName, x.MiddleName,
                    x.Email, x.IamProfileId, x.IsActive, x.CreatedAt))
                .FirstOrDefaultAsync(ct);

            return st is null
                ? Result<StudentDto>.Failure(new Error("me.student_not_found", "Student is not linked to this profile."))
                : Result<StudentDto>.Success(st);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get student by profileId");
            return Result<StudentDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}