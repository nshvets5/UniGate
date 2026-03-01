using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students.UseCases;

public sealed class UpdateStudentUseCase
{
    private readonly IStudentStore _store;

    public UpdateStudentUseCase(IStudentStore store) => _store = store;

    public Task<Result> ExecuteAsync(UpdateStudentCommand cmd, CancellationToken ct = default)
    {
        if (cmd.Id == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Id is required.")));

        if (string.IsNullOrWhiteSpace(cmd.FirstName) || string.IsNullOrWhiteSpace(cmd.LastName))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("FirstName and LastName are required.")));

        if (string.IsNullOrWhiteSpace(cmd.Email))
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("Email is required.")));

        return _store.UpdateAsync(cmd, ct);
    }
}