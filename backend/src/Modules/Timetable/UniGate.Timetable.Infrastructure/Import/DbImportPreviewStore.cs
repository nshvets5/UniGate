using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Import;
using UniGate.Timetable.Domain;
using UniGate.Timetable.Infrastructure.Persistence;

namespace UniGate.Timetable.Infrastructure.Import;

public sealed class DbImportPreviewStore : IImportPreviewStore
{
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(30);

    private readonly TimetableDbContext _db;
    private readonly ILogger<DbImportPreviewStore> _logger;

    public DbImportPreviewStore(TimetableDbContext db, ILogger<DbImportPreviewStore> logger)
    {
        _db = db;
        _logger = logger;
    }

    public async Task<Result<string>> SaveAsync(PreviewPayload payload, CancellationToken ct = default)
    {
        try
        {
            var token = Guid.NewGuid().ToString("N");

            var payloadJson = JsonSerializer.Serialize(payload);

            var preview = new TimetableImportPreview(
                token: token,
                sourceType: payload.SourceType,
                sourceFileName: payload.SourceFileName,
                importedByProvider: payload.ImportedByProvider,
                importedBySubject: payload.ImportedBySubject,
                payloadJson: payloadJson,
                totalRows: payload.TotalRows,
                skippedRows: payload.SkippedRows,
                expiresAt: DateTimeOffset.UtcNow.Add(Ttl));

            _db.ImportPreviews.Add(preview);
            await _db.SaveChangesAsync(ct);

            return Result<string>.Success(token);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save import preview");
            return Result<string>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PreviewPayload>> GetAsync(string token, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(token))
                return Result<PreviewPayload>.Failure(
                    Errors.Validation.Failed("Preview token is required."));

            var preview = await _db.ImportPreviews
                .FirstOrDefaultAsync(x => x.Token == token, ct);

            if (preview is null)
                return Result<PreviewPayload>.Failure(
                    new Error("preview.not_found", "Preview not found."));

            if (preview.IsApplied)
                return Result<PreviewPayload>.Failure(
                    new Error("preview.already_applied", "Preview has already been applied."));

            if (preview.IsExpired(DateTimeOffset.UtcNow))
                return Result<PreviewPayload>.Failure(
                    new Error("preview.expired", "Preview has expired."));

            var payload = JsonSerializer.Deserialize<PreviewPayload>(preview.PayloadJson);
            if (payload is null)
                return Result<PreviewPayload>.Failure(
                    new Error("preview.invalid_payload", "Preview payload is invalid."));

            return Result<PreviewPayload>.Success(payload);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load import preview");
            return Result<PreviewPayload>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> DeleteAsync(string token, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(token))
                return Result.Failure(Errors.Validation.Failed("Preview token is required."));

            var preview = await _db.ImportPreviews
                .FirstOrDefaultAsync(x => x.Token == token, ct);

            if (preview is null)
                return Result.Success(); // idempotent delete

            _db.ImportPreviews.Remove(preview);
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete import preview");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<PreviewStoreStats> GetStatsAsync(CancellationToken ct = default)
    {
        try
        {
            var now = DateTimeOffset.UtcNow;

            var all = await _db.ImportPreviews.AsNoTracking().ToListAsync(ct);

            var expired = all.Count(x => x.ExpiresAt <= now);
            var oldest = all.OrderBy(x => x.CreatedAt).FirstOrDefault()?.CreatedAt;
            var newest = all.OrderByDescending(x => x.CreatedAt).FirstOrDefault()?.CreatedAt;

            return new PreviewStoreStats(
                TotalEntries: all.Count,
                ExpiredEntries: expired,
                OldestEntry: oldest,
                NewestEntry: newest);
        }
        catch
        {
            return new PreviewStoreStats(0, 0, null, null);
        }
    }

    public async Task<Result> MarkAppliedAsync(string token, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(token))
                return Result.Failure(Errors.Validation.Failed("Preview token is required."));

            var preview = await _db.ImportPreviews
                .FirstOrDefaultAsync(x => x.Token == token, ct);

            if (preview is null)
                return Result.Failure(new Error("preview.not_found", "Preview not found."));

            if (preview.IsApplied)
                return Result.Success();

            preview.MarkApplied();
            await _db.SaveChangesAsync(ct);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to mark preview as applied");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}