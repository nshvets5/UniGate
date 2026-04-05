using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Auth;
using UniGate.Devices.Infrastructure.Persistence;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Auth;

public sealed class EfReaderAuthStore : IReaderAuthStore
{
    private readonly DevicesDbContext _db;
    private readonly ILogger<EfReaderAuthStore> _logger;

    public EfReaderAuthStore(DevicesDbContext db, ILogger<EfReaderAuthStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<ReaderAuthDto>> FindByApiKeyAsync(string apiKey, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(apiKey))
                return Result<ReaderAuthDto>.Failure(
                    Errors.Validation.Failed("Api key is required."));

            var hash = Hash(apiKey);

            var item = await _db.ReaderDevices.AsNoTracking()
                .Where(x => x.ApiKeyHash == hash)
                .Select(x => new ReaderAuthDto(
                    x.Id,
                    x.Code,
                    x.IsActive,
                    x.ApiKeyHash!))
                .FirstOrDefaultAsync(ct);

            return item is null
                ? Result<ReaderAuthDto>.Failure(new Error("device.auth.invalid", "Invalid api key"))
                : Result<ReaderAuthDto>.Success(item);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FindByApiKey failed");
            return Result<ReaderAuthDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    private static string Hash(string value)
        => Convert.ToBase64String(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(value)));
}