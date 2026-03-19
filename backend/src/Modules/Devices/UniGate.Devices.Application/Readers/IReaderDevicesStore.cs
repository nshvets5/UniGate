using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Readers;

public interface IReaderDevicesStore
{
    Task<Result<Guid>> CreateAsync(CreateReaderDeviceCommand cmd, CancellationToken ct = default);

    Task<Result<PagedResult<ReaderDeviceDto>>> ListAsync(string? search, int page, int pageSize, CancellationToken ct = default);

    Task<Result<ReaderDeviceDto>> GetAsync(Guid id, CancellationToken ct = default);

    Task<Result<ReaderDeviceDto>> GetByCodeAsync(string code, CancellationToken ct = default);

    Task<Result> UpdateAsync(UpdateReaderDeviceCommand cmd, CancellationToken ct = default);

    Task<Result> SetActiveAsync(Guid id, bool isActive, CancellationToken ct = default);

    Task<Result> TouchAsync(Guid id, CancellationToken ct = default);
}