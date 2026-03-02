using UniGate.Access.Application.Admin.Doors;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Doors;

public sealed class UpdateDoorUseCase
{
    private readonly IAccessAdminStore _store;

    public UpdateDoorUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result> ExecuteAsync(UpdateDoorCommand cmd, CancellationToken ct)
    {
        if (cmd.Id == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")));

        if (cmd.ZoneId == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("ZoneId is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Code) || string.IsNullOrWhiteSpace(cmd.Name))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Code and Name are required.")));

        return _store.UpdateDoorAsync(cmd, ct);
    }
}