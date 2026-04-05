using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Credentials;

public sealed class SetStudentCredentialActiveUseCase
{
    private readonly IStudentCredentialStore _store;

    public SetStudentCredentialActiveUseCase(IStudentCredentialStore store)
    {
        _store = store;
    }

    public Task<Result> ExecuteAsync(Guid credentialId, bool isActive, CancellationToken ct = default)
    {
        if (credentialId == Guid.Empty)
            return Task.FromResult(Result.Failure(Errors.Validation.Failed("CredentialId is required.")));

        return _store.SetActiveAsync(credentialId, isActive, ct);
    }
}