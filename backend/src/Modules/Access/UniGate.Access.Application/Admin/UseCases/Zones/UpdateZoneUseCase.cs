using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases;

public sealed class UpdateZoneUseCase
{
    private readonly IAccessAdminStore _store;
    public UpdateZoneUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result> ExecuteAsync(UpdateZoneCommand cmd, CancellationToken ct)
    {
        if (cmd.Id == Guid.Empty || string.IsNullOrWhiteSpace(cmd.Code) || string.IsNullOrWhiteSpace(cmd.Name))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id, Code, Name are required.")));

        return _store.UpdateZoneAsync(cmd, ct);
    }
}