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

    public EfStudentLookup(
        DirectoryDbContext db,
        ILogger<EfStudentLookup> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<StudentRef>> FindByProfileIdAsync(
        Guid iamProfileId,
        CancellationToken ct = default)
    {
        try
        {
            if (iamProfileId == Guid.Empty)
            {
                return Result<StudentRef>.Failure(
                    Errors.Validation.Failed(
                        "IamProfileId is required."));
            }

            var student = await _db.Students
                .AsNoTracking()
                .Where(x => x.IamProfileId == iamProfileId)
                .Select(x => new StudentRef(
                    x.Id,
                    x.GroupId,
                    x.IamProfileId!.Value,
                    x.IsActive))
                .FirstOrDefaultAsync(ct);

            return ValidateStudent(student);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to look up student by profile id");

            return Result<StudentRef>.Failure(
                Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<StudentRef>> FindByIdAsync(
        Guid studentId,
        CancellationToken ct = default)
    {
        try
        {
            if (studentId == Guid.Empty)
            {
                return Result<StudentRef>.Failure(
                    Errors.Validation.Failed(
                        "StudentId is required."));
            }

            var student = await _db.Students
                .AsNoTracking()
                .Where(x => x.Id == studentId)
                .Select(x => new StudentRef(
                    x.Id,
                    x.GroupId,
                    x.IamProfileId ?? Guid.Empty,
                    x.IsActive))
                .FirstOrDefaultAsync(ct);

            return ValidateStudent(student);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to look up student by id");

            return Result<StudentRef>.Failure(
                Errors.Infrastructure.DatabaseFailure);
        }
    }

    private static Result<StudentRef> ValidateStudent(
        StudentRef? student)
    {
        if (student is null)
        {
            return Result<StudentRef>.Failure(
                new Error(
                    "student.not_found",
                    "Student was not found."));
        }

        if (!student.IsActive)
        {
            return Result<StudentRef>.Failure(
                new Error(
                    "student.inactive",
                    "Student is inactive."));
        }

        return Result<StudentRef>.Success(student);
    }
}