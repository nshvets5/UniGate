using UniGate.SharedKernel.Results;

namespace UniGate.SharedKernel.Directory;

public sealed record RoomRef(
    Guid RoomId,
    string Code,
    string Name,
    Guid AccessZoneId,
    bool IsActive);

public interface IRoomLookup
{
    Task<Result<RoomRef>> FindByCodeAsync(string code, CancellationToken ct = default);
}