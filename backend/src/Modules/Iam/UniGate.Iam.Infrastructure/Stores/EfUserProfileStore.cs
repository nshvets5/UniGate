using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using UniGate.Iam.Application.Abstractions;
using UniGate.Iam.Domain;
using UniGate.Iam.Infrastructure.Outbox;
using UniGate.Iam.Infrastructure.Persistence;
using UniGate.SharedKernel.Observability;
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

    public async Task<Result<EnsureUserProfileResult>> EnsureAsync(
        string provider,
        string subject,
        string? email,
        string? displayName,
        IRequestContext requestContext,
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
                return Result<EnsureUserProfileResult>.Success(new EnsureUserProfileResult(existing, Created: false));

            var profile = new UserProfile(email, displayName);
            var identity = new ExternalIdentity(provider, subject, profile.Id);

            _db.UserProfiles.Add(profile);
            _db.ExternalIdentities.Add(identity);

            var payload = JsonSerializer.Serialize(new
            {
                provider,
                subject,
                profileId = profile.Id,
                email,
                displayName,
                occurredAt = DateTimeOffset.UtcNow
            });

            _db.OutboxMessages.Add(new OutboxMessage(
                type: "iam.user_profile_provisioned",
                payloadJson: payload,
                correlationId: requestContext.CorrelationId,
                traceId: requestContext.TraceId));

            await _db.SaveChangesAsync(ct);

            return Result<EnsureUserProfileResult>.Success(new EnsureUserProfileResult(profile.Id, Created: true));
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "DbUpdateException during EnsureAsync(provider={Provider}, subject={Subject})", provider, subject);
            return Result<EnsureUserProfileResult>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error during EnsureAsync(provider={Provider}, subject={Subject})", provider, subject);
            return Result<EnsureUserProfileResult>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}
