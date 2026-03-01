using Microsoft.EntityFrameworkCore;
using UniGate.Iam.Infrastructure.Persistence;

namespace UniGate.Iam.Infrastructure.Outbox;

public sealed class EfOutboxReader : IOutboxReader
{
    private readonly IamDbContext _db;

    public EfOutboxReader(IamDbContext db) => _db = db;

    public async Task<IReadOnlyList<OutboxMessage>> DequeueBatchAsync(int batchSize, CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;

        var sql = @"
            select *
            from outbox.messages
            where ""ProcessedAt"" is null
              and ""AvailableAt"" <= {0}
            order by ""OccurredAt""
            for update skip locked
            limit {1};
            ";

        return await _db.OutboxMessages
            .FromSqlRaw(sql, now, batchSize)
            .ToListAsync(ct);
    }

    public async Task MarkProcessedAsync(Guid messageId, CancellationToken ct)
    {
        var msg = await _db.OutboxMessages.FirstOrDefaultAsync(x => x.Id == messageId, ct);
        if (msg is null) return;

        msg.MarkProcessed();
        await _db.SaveChangesAsync(ct);
    }

    public async Task MarkFailedAsync(Guid messageId, string error, TimeSpan retryDelay, CancellationToken ct)
    {
        var msg = await _db.OutboxMessages.FirstOrDefaultAsync(x => x.Id == messageId, ct);
        if (msg is null) return;

        msg.MarkFailed(error, retryDelay);
        await _db.SaveChangesAsync(ct);
    }
}
