using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Scan;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.MobileCredentials;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Scan;

public sealed class DirectoryCredentialResolver
    : ICredentialResolver
{
    private readonly IStudentCredentialLookup _lookup;
    private readonly IMobileCredentialService
        _mobileCredentials;

    private readonly ILogger<DirectoryCredentialResolver>
        _logger;

    public DirectoryCredentialResolver(
        IStudentCredentialLookup lookup,
        IMobileCredentialService mobileCredentials,
        ILogger<DirectoryCredentialResolver> logger)
    {
        _lookup = lookup;
        _mobileCredentials = mobileCredentials;
        _logger = logger;
    }

    public async Task<Result<ResolvedCredentialDto>>
        ResolveAsync(
            string type,
            string value,
            CancellationToken ct = default)
    {
        try
        {
            var normalizedType =
                type.Trim().ToLowerInvariant();

            if (normalizedType ==
                MobileCredentialTypes.MobileQr)
            {
                return await ResolveMobileCredentialAsync(
                    value,
                    ct);
            }

            var result = await _lookup.ResolveAsync(
                normalizedType,
                value,
                ct);

            if (!result.IsSuccess)
            {
                return Result<ResolvedCredentialDto>.Failure(
                    result.Error);
            }

            return Result<ResolvedCredentialDto>.Success(
                new ResolvedCredentialDto(
                    result.Value.CredentialId,
                    result.Value.StudentId,
                    result.Value.GroupId,
                    result.Value.StudentIsActive,
                    result.Value.CredentialIsActive));
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Resolve credential bridge failed");

            return Result<ResolvedCredentialDto>.Failure(
                Errors.Infrastructure.DatabaseFailure);
        }
    }

    private async Task<Result<ResolvedCredentialDto>>
        ResolveMobileCredentialAsync(
            string token,
            CancellationToken ct)
    {
        var result =
            await _mobileCredentials
                .ValidateAndConsumeAsync(token, ct);

        if (!result.IsSuccess)
        {
            return Result<ResolvedCredentialDto>.Failure(
                result.Error);
        }

        return Result<ResolvedCredentialDto>.Success(
            new ResolvedCredentialDto(
                CredentialId: result.Value.TokenId,
                StudentId: result.Value.StudentId,
                GroupId: result.Value.GroupId,
                StudentIsActive: true,
                CredentialIsActive: true));
    }
}