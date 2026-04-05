using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Application.Scan;

public sealed class ReaderScanUseCase
{
    private readonly IReaderScanStore _store;
    private readonly ICredentialResolver _resolver;
    private readonly IAccessDecisionGateway _access;

    public ReaderScanUseCase(
        IReaderScanStore store,
        ICredentialResolver resolver,
        IAccessDecisionGateway access)
    {
        _store = store;
        _resolver = resolver;
        _access = access;
    }

    public async Task<Result<ReaderScanResultDto>> ExecuteAsync(ReaderScanCommand cmd, CancellationToken ct = default)
    {
        if (cmd.ReaderId == Guid.Empty)
            return Result<ReaderScanResultDto>.Failure(Errors.Validation.Failed("ReaderId is required."));

        if (string.IsNullOrWhiteSpace(cmd.CredentialType))
            return Result<ReaderScanResultDto>.Failure(Errors.Validation.Failed("CredentialType is required."));

        if (string.IsNullOrWhiteSpace(cmd.CredentialValue))
            return Result<ReaderScanResultDto>.Failure(Errors.Validation.Failed("CredentialValue is required."));

        var readerRes = await _store.GetReaderDoorAsync(cmd.ReaderId, ct);
        if (!readerRes.IsSuccess)
            return Result<ReaderScanResultDto>.Failure(readerRes.Error);

        var reader = readerRes.Value;

        if (!reader.ReaderIsActive)
        {
            await _store.LogAttemptAsync(new ReaderScanLogEntry(
                cmd.ReaderId,
                cmd.CredentialType,
                cmd.CredentialValue,
                null,
                null,
                false,
                "READER_INACTIVE"), ct);

            return Result<ReaderScanResultDto>.Success(new ReaderScanResultDto(
                false,
                "READER_INACTIVE",
                cmd.ReaderId,
                reader.DoorId,
                null,
                null));
        }

        var credentialRes = await _resolver.ResolveAsync(cmd.CredentialType, cmd.CredentialValue, ct);
        if (!credentialRes.IsSuccess)
        {
            await _store.LogAttemptAsync(new ReaderScanLogEntry(
                cmd.ReaderId,
                cmd.CredentialType,
                cmd.CredentialValue,
                null,
                null,
                false,
                "CREDENTIAL_NOT_FOUND"), ct);

            await _store.TouchReaderAsync(cmd.ReaderId, ct);

            return Result<ReaderScanResultDto>.Success(new ReaderScanResultDto(
                false,
                "CREDENTIAL_NOT_FOUND",
                cmd.ReaderId,
                reader.DoorId,
                null,
                null));
        }

        var credential = credentialRes.Value;

        if (!credential.CredentialIsActive)
        {
            await _store.LogAttemptAsync(new ReaderScanLogEntry(
                cmd.ReaderId,
                cmd.CredentialType,
                cmd.CredentialValue,
                credential.CredentialId,
                credential.StudentId,
                false,
                "CREDENTIAL_INACTIVE"), ct);

            await _store.TouchReaderAsync(cmd.ReaderId, ct);

            return Result<ReaderScanResultDto>.Success(new ReaderScanResultDto(
                false,
                "CREDENTIAL_INACTIVE",
                cmd.ReaderId,
                reader.DoorId,
                credential.StudentId,
                credential.CredentialId));
        }

        if (!credential.StudentIsActive)
        {
            await _store.LogAttemptAsync(new ReaderScanLogEntry(
                cmd.ReaderId,
                cmd.CredentialType,
                cmd.CredentialValue,
                credential.CredentialId,
                credential.StudentId,
                false,
                "STUDENT_INACTIVE"), ct);

            await _store.TouchReaderAsync(cmd.ReaderId, ct);

            return Result<ReaderScanResultDto>.Success(new ReaderScanResultDto(
                false,
                "STUDENT_INACTIVE",
                cmd.ReaderId,
                reader.DoorId,
                credential.StudentId,
                credential.CredentialId));
        }

        var accessRes = await _access.CheckStudentDoorAccessAsync(credential.StudentId, reader.DoorId, ct);
        if (!accessRes.IsSuccess)
            return Result<ReaderScanResultDto>.Failure(accessRes.Error);

        var allowed = accessRes.Value;
        var reason = allowed ? "ALLOW" : "DENY";

        await _store.LogAttemptAsync(new ReaderScanLogEntry(
            cmd.ReaderId,
            cmd.CredentialType,
            cmd.CredentialValue,
            credential.CredentialId,
            credential.StudentId,
            allowed,
            reason), ct);

        await _store.TouchReaderAsync(cmd.ReaderId, ct);

        return Result<ReaderScanResultDto>.Success(new ReaderScanResultDto(
            allowed,
            reason,
            cmd.ReaderId,
            reader.DoorId,
            credential.StudentId,
            credential.CredentialId));
    }
}