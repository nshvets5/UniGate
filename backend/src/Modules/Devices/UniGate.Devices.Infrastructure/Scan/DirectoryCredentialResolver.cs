using Microsoft.Extensions.Logging;
using UniGate.Devices.Application.Scan;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Devices.Infrastructure.Scan;

public sealed class DirectoryCredentialResolver : ICredentialResolver
{
    private readonly IStudentCredentialLookup _lookup;
    private readonly ILogger<DirectoryCredentialResolver> _logger;

    public DirectoryCredentialResolver(
        IStudentCredentialLookup lookup,
        ILogger<DirectoryCredentialResolver> logger)
    {
        _lookup = lookup;
        _logger = logger;
    }

    public async Task<Result<ResolvedCredentialDto>> ResolveAsync(string type, string value, CancellationToken ct = default)
    {
        try
        {
            var res = await _lookup.ResolveAsync(type, value, ct);
            if (!res.IsSuccess)
                return Result<ResolvedCredentialDto>.Failure(res.Error);

            return Result<ResolvedCredentialDto>.Success(new ResolvedCredentialDto(
                res.Value.CredentialId,
                res.Value.StudentId,
                res.Value.GroupId,
                res.Value.StudentIsActive,
                res.Value.CredentialIsActive));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Resolve credential bridge failed");
            return Result<ResolvedCredentialDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }
}