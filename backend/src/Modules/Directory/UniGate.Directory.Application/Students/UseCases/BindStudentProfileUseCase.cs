using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students.UseCases;

public sealed class BindStudentProfileUseCase
{
    private readonly IStudentStore _store;

    public BindStudentProfileUseCase(IStudentStore store) => _store = store;

    public Task<Result> ExecuteAsync(BindStudentProfileCommand cmd, CancellationToken ct = default)
    {
        if (cmd.Id == Guid.Empty || cmd.IamProfileId == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id and IamProfileId are required.")));

        return _store.BindProfileAsync(cmd, ct);
    }
}