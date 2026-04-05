using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Credentials;

public sealed class ListStudentCredentialsUseCase
{
    private readonly IStudentCredentialStore _store;

    public ListStudentCredentialsUseCase(IStudentCredentialStore store)
    {
        _store = store;
    }

    public Task<Result<IReadOnlyList<StudentCredentialDto>>> ExecuteAsync(Guid studentId, CancellationToken ct = default)
    {
        if (studentId == Guid.Empty)
            return Task.FromResult(Result<IReadOnlyList<StudentCredentialDto>>.Failure(
                Errors.Validation.Failed("StudentId is required.")));

        return _store.ListByStudentAsync(studentId, ct);
    }
}