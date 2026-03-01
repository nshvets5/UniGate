using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students.UseCases;

public sealed class CreateStudentUseCase
{
    private readonly IStudentStore _store;

    public CreateStudentUseCase(IStudentStore store) => _store = store;

    public Task<Result<Guid>> ExecuteAsync(CreateStudentCommand cmd, CancellationToken ct = default)
    {
        if (cmd.GroupId == Guid.Empty)
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("GroupId is required.")));

        if (string.IsNullOrWhiteSpace(cmd.FirstName) || string.IsNullOrWhiteSpace(cmd.LastName))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("FirstName and LastName are required.")));

        if (string.IsNullOrWhiteSpace(cmd.Email))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Email is required.")));

        return _store.CreateAsync(cmd, ct);
    }
}