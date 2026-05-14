using UniGate.Access.Application.Admin.Rules;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Rules;

public sealed class CreateRuleUseCase
{
    private readonly IAccessAdminStore _store;

    public CreateRuleUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result<Guid>> ExecuteAsync(CreateRuleCommand cmd, CancellationToken ct)
    {
        if (cmd.GroupId == Guid.Empty || cmd.TargetId == Guid.Empty)
        {
            return Task.FromResult(Result<Guid>.Failure(
                Errors.Validation.Failed("GroupId and TargetId are required.")));
        }

        return _store.CreateRuleAsync(cmd, ct);
    }
}