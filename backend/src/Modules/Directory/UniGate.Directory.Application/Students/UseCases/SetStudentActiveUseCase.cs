using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students.UseCases;

public sealed class SetStudentActiveUseCase
{
    private readonly IStudentStore _store;

    public SetStudentActiveUseCase(IStudentStore store) => _store = store;

    public Task<Result> ExecuteAsync(SetStudentActiveCommand cmd, CancellationToken ct = default)
    {
        if (cmd.Id == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")));

        return _store.SetActiveAsync(cmd, ct);
    }
}