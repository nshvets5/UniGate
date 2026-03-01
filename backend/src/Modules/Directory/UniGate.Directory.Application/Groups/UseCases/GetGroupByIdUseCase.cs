using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Groups.UseCases;

public sealed class GetGroupByIdUseCase
{
    private readonly IGroupStore _store;

    public GetGroupByIdUseCase(IGroupStore store) => _store = store;

    public Task<Result<GroupDto>> ExecuteAsync(GetGroupByIdQuery query, CancellationToken ct = default)
    {
        if (query.Id == Guid.Empty)
            return Task.FromResult(Result<GroupDto>.Failure(Errors.Validation.Failed("Id is required.")));

        return _store.GetByIdAsync(query, ct);
    }
}