using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students.UseCases;

public sealed class ChangeStudentGroupUseCase
{
    private readonly IStudentStore _store;

    public ChangeStudentGroupUseCase(IStudentStore store) => _store = store;

    public Task<Result> ExecuteAsync(ChangeStudentGroupCommand cmd, CancellationToken ct = default)
    {
        if (cmd.Id == Guid.Empty || cmd.GroupId == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id and GroupId are required.")));

        return _store.ChangeGroupAsync(cmd, ct);
    }
}