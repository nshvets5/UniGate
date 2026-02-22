using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Iam.Application.Abstractions;
using UniGate.Iam.Domain;
using UniGate.Iam.Infrastructure.Persistence;
using UniGate.SharedKernel.Results;

namespace UniGate.Iam.Infrastructure.Stores;

public sealed class EfUserProfileStore : IUserProfileStore
{
    private readonly IamDbContext _db;
    private readonly ILogger<EfUserProfileStore> _logger;

    public EfUserProfileStore(IamDbContext db, ILogger<EfUserProfileStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<Guid>> EnsureAsync(
        string provider,
        string subject,
        string? email,
        string? displayName,
        CancellationToken ct = default)
    {
        try
        {
            var existing = await _db.ExternalIdentities
                .AsNoTracking()
                .Where(x => x.Provider == provider && x.Subject == subject)
                .Select(x => x.UserProfileId)
                .FirstOrDefaultAsync(ct);

            if (existing != Guid.Empty)
                return Result<Guid>.Success(existing);

            var profile = new UserProfile(email, displayName);
            var identity = new ExternalIdentity(provider, subject, profile.Id);

            _db.UserProfiles.Add(profile);
            _db.ExternalIdentities.Add(identity);

            await _db.SaveChangesAsync(ct);

            return Result<Guid>.Success(profile.Id);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex,
                "DbUpdateException during EnsureAsync(provider={Provider}, subject={Subject})",
                provider, subject);

            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Unexpected exception during EnsureAsync(provider={Provider}, subject={Subject})",
                provider, subject);

            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}
