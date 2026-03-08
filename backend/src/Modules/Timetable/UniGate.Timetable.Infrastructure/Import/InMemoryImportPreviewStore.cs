using System.Collections.Concurrent;
using UniGate.SharedKernel.Results;
using UniGate.Timetable.Application.Import;

namespace UniGate.Timetable.Infrastructure.Import;

public sealed class InMemoryImportPreviewStore : IImportPreviewStore
{
    private sealed record Entry(PreviewPayload Payload, DateTimeOffset CreatedAt);

    private readonly ConcurrentDictionary<string, Entry> _entries = new();
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(30);

    public Task<Result<string>> SaveAsync(PreviewPayload payload, CancellationToken ct = default)
    {
        CleanupExpired();

        var token = Guid.NewGuid().ToString("N");
        _entries[token] = new Entry(payload, DateTimeOffset.UtcNow);

        return Task.FromResult(Result<string>.Success(token));
    }

    public Task<Result<PreviewPayload>> GetAsync(string token, CancellationToken ct = default)
    {
        CleanupExpired();

        if (string.IsNullOrWhiteSpace(token))
            return Task.FromResult(Result<PreviewPayload>.Failure(
                Errors.Validation.Failed("Preview token is required.")));

        if (!_entries.TryGetValue(token, out var entry))
            return Task.FromResult(Result<PreviewPayload>.Failure(
                new Error("preview.not_found", "Preview not found or expired.")));

        return Task.FromResult(Result<PreviewPayload>.Success(entry.Payload));
    }

    public Task<Result> DeleteAsync(string token, CancellationToken ct = default)
    {
        CleanupExpired();

        if (string.IsNullOrWhiteSpace(token))
            return Task.FromResult(Result.Failure(
                Errors.Validation.Failed("Preview token is required.")));

        _entries.TryRemove(token, out _);
        return Task.FromResult(Result.Success());
    }

    private void CleanupExpired()
    {
        var now = DateTimeOffset.UtcNow;

        foreach (var pair in _entries)
        {
            if (now - pair.Value.CreatedAt > Ttl)
                _entries.TryRemove(pair.Key, out _);
        }
    }
}