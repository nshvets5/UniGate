using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students.UseCases;

public sealed class ListStudentsUseCase
{
    private readonly IStudentStore _store;

    public ListStudentsUseCase(IStudentStore store) => _store = store;

    public Task<Result<PagedResult<StudentDto>>> ExecuteAsync(ListStudentsQuery query, CancellationToken ct = default)
    {
        if (query.Page < 1)
            return Task.FromResult(Result<PagedResult<StudentDto>>.Failure(Errors.Validation.Failed("Page must be >= 1.")));

        if (query.PageSize is < 1 or > 200)
            return Task.FromResult(Result<PagedResult<StudentDto>>.Failure(Errors.Validation.Failed("PageSize must be between 1 and 200.")));

        return _store.ListAsync(query, ct);
    }
}