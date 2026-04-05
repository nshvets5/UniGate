using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Credentials;

public sealed class CreateStudentCredentialUseCase
{
    private readonly IStudentCredentialStore _store;

    public CreateStudentCredentialUseCase(IStudentCredentialStore store)
    {
        _store = store;
    }

    public Task<Result<Guid>> ExecuteAsync(CreateStudentCredentialCommand cmd, CancellationToken ct = default)
    {
        if (cmd.StudentId == Guid.Empty)
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("StudentId is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Type))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Type is required.")));

        if (string.IsNullOrWhiteSpace(cmd.Value))
            return Task.FromResult(Result<Guid>.Failure(Errors.Validation.Failed("Value is required.")));

        return _store.CreateAsync(cmd, ct);
    }
}