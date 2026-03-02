using UniGate.Access.Application.Admin.Rules;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Rules;

public sealed class CreateRuleUseCase
{
    private readonly IAccessAdminStore _store;

    public CreateRuleUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<Guid>> ExecuteAsync(CreateRuleCommand cmd, CancellationToken ct)
    {
        if (cmd.ZoneId == Guid.Empty || cmd.GroupId == Guid.Empty)
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("ZoneId and GroupId are required.")));

        return _store.CreateRuleAsync(cmd, ct);
    }
}