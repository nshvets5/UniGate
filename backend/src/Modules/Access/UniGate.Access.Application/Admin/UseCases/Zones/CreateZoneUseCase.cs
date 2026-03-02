using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases;

public sealed class CreateZoneUseCase
{
    private readonly IAccessAdminStore _store;
    public CreateZoneUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<Guid>> ExecuteAsync(CreateZoneCommand cmd, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(cmd.Code) || string.IsNullOrWhiteSpace(cmd.Name))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Code and Name are required.")));

        return _store.CreateZoneAsync(cmd, ct);
    }
}