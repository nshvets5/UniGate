using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Doors;

public sealed class CreateDoorUseCase
{
    private readonly IAccessAdminStore _store;

    public CreateDoorUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<Guid>> ExecuteAsync(CreateDoorCommand cmd, CancellationToken ct)
    {
        if (cmd.ZoneId == Guid.Empty)
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("ZoneId is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Code) || string.IsNullOrWhiteSpace(cmd.Name))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Code and Name are required.")));

        return _store.CreateDoorAsync(cmd, ct);
    }
}