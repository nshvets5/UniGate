using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Devices.Domain;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.SharedKernel.MobileCredentials;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.MobileCredentials;

public sealed class EfMobileCredentialTokenStore
    : IMobileCredentialTokenStore
{
    private readonly DevicesDbContext _db;
    private readonly ILogger<EfMobileCredentialTokenStore> _logger;

    public EfMobileCredentialTokenStore(
        DevicesDbContext db,
        ILogger<EfMobileCredentialTokenStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result> CreateAsync(
        MobileCredentialTokenRecord token,
        CancellationToken ct = default)
    {
        try
        {
            var entity = new MobileCredentialToken(
                token.TokenId,
                token.StudentId,
                token.IssuedAt,
                token.ExpiresAt);

            _db.MobileCredentialTokens.Add(entity);

            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(
                ex,
                "Failed to save mobile credential token {TokenId}",
                token.TokenId);

            return Result.Failure(
                Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to create mobile credential token");

            return Result.Failure(
                Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<bool>> ConsumeAsync(
        Guid tokenId,
        Guid studentId,
        DateTimeOffset nowUtc,
        CancellationToken ct = default)
    {
        try
        {
            var affected = await _db.MobileCredentialTokens
                .Where(x =>
                    x.Id == tokenId &&
                    x.StudentId == studentId &&
                    x.UsedAt == null &&
                    x.ExpiresAt >= nowUtc)
                .ExecuteUpdateAsync(
                    setters => setters
                        .SetProperty(
                            x => x.UsedAt,
                            nowUtc),
                    ct);

            return Result<bool>.Success(affected == 1);
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Failed to consume mobile credential token {TokenId}",
                tokenId);

            return Result<bool>.Failure(
                Errors.Infrastructure.DatabaseFailure);
        }
    }
}