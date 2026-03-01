using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Groups.UseCases;

public sealed class UpdateGroupUseCase
{
    private readonly IGroupStore _store;

    public UpdateGroupUseCase(IGroupStore store) => _store = store;

    public Task<Result> ExecuteAsync(UpdateGroupCommand cmd, CancellationToken ct = default)
    {
        if (cmd.Id == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Code))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Code is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Name))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Name is required.")));

        if (cmd.AdmissionYear is < 1990 or > 2100)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("AdmissionYear is invalid.")));

        return _store.UpdateAsync(cmd, ct);
    }
}