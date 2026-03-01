using UniGate.Directory.Application.Students;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Me;

public sealed class GetMyStudentUseCase
{
    private readonly IMyDirectoryQuery _query;

    public GetMyStudentUseCase(IMyDirectoryQuery query) => _query = query;

    public Task<Result<StudentDto>> ExecuteAsync(GetMyStudentQuery query, CancellationToken ct = default)
    {
        if (query.IamProfileId == Guid.Empty)
            return Task.FromResult(Result<StudentDto>.Failure(Errors.Validation.Failed("IamProfileId is required.")));

        return _query.GetStudentByProfileIdAsync(query, ct);
    }
}