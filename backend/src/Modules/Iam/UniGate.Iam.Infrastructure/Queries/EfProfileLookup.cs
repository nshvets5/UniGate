using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Iam.Infrastructure.Persistence;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Infrastructure.Queries;

public sealed class EfProfileLookup : IProfileLookup
{
    private readonly IamDbContext _db;
    private readonly ILogger<EfProfileLookup> _logger;

    public EfProfileLookup(IamDbContext db, ILogger<EfProfileLookup> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid?>> FindProfileIdByEmailAsync(string email, CancellationToken ct = default)
    {
        try
        {
            var normalized = email.Trim().ToLowerInvariant();

            var profileId = await _db.UserProfiles.AsNoTracking()
                .Where(x => x.Email != null && x.Email.ToLower() == normalized)
                .Select(x => (Guid?)x.Id)
                .FirstOrDefaultAsync(ct);

            return Result<Guid?>.Success(profileId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to lookup profile by email");
            return Result<Guid?>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}