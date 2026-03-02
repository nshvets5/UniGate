using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Rules;

public sealed class UpdateRuleScheduleUseCase
{
    private readonly IAccessAdminStore _store;

    public UpdateRuleScheduleUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result> ExecuteAsync(UpdateRuleScheduleCommand cmd, CancellationToken ct)
    {
        if (cmd.Id == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")));

        if ((cmd.StartTime is null) != (cmd.EndTime is null))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("StartTime and EndTime must be both set or both null.")));

        if (cmd.ValidFrom is not null && cmd.ValidTo is not null && cmd.ValidTo < cmd.ValidFrom)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("ValidTo must be >= ValidFrom.")));

        return _store.UpdateRuleScheduleAsync(cmd, ct);
    }
}