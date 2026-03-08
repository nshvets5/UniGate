using Microsoft.Extensions.Diagnostics.HealthChecks;
using UniGate.Timetable.Application.Import;

namespace UniGate.Timetable.Infrastructure.Health;

public sealed class PreviewStoreHealthCheck : IHealthCheck
{
    private readonly IImportPreviewStore _store;

    public PreviewStoreHealthCheck(IImportPreviewStore store)
    {
        _store = store;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var stats = await _store.GetStatsAsync(cancellationToken);

        var data = new Dictionary<string, object?>
        {
            ["entries"] = stats.TotalEntries,
            ["expired"] = stats.ExpiredEntries,
            ["oldest"] = stats.OldestEntry,
            ["newest"] = stats.NewestEntry
        };

        return HealthCheckResult.Healthy("Preview store OK", data);
    }
}