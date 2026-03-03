using UniGate.Access.Application.Admin.Rules;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Admin.UseCases.Rules;

public sealed class UpdateRuleScheduleUseCase
{
    private readonly IAccessAdminStore _store;

    public UpdateRuleScheduleUseCase(IAccessAdminStore store) => _store = store;

    public Task<Result> ExecuteAsync(UpdateRuleScheduleCommand cmd, CancellationToken ct)
    {
        if (cmd.Windows is null || cmd.Windows.Count == 0)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Windows are required.")));

        foreach (var w in cmd.Windows)
        {
            if (w.DayOfWeekIso is < 1 or > 7)
                return Task.FromResult(Result.Failure(Errors.Validation.Failed("DayOfWeekIso must be 1..7.")));

            if (w.StartTime == w.EndTime)
                return Task.FromResult(Result.Failure(Errors.Validation.Failed("StartTime and EndTime cannot be equal.")));
        }

        if (cmd.ValidFrom is not null && cmd.ValidTo is not null && cmd.ValidTo < cmd.ValidFrom)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("ValidTo must be >= ValidFrom.")));

        return _store.UpdateRuleScheduleAsync(cmd, ct);
    }
}