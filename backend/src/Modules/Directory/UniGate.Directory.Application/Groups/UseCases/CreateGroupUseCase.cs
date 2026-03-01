using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Groups.UseCases;

public sealed class CreateGroupUseCase
{
    private readonly IGroupStore _store;

    public CreateGroupUseCase(IGroupStore store)
    {
        _store = store;
    }

    public Task<Result<Guid>> ExecuteAsync(CreateGroupCommand cmd, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(cmd.Code))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Code is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Name))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Name is required.")));

        if (cmd.AdmissionYear is < 1990 or > 2100)
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("AdmissionYear is invalid.")));

        return _store.CreateAsync(cmd, ct);
    }
}