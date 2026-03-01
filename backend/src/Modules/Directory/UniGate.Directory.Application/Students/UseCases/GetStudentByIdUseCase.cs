using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students.UseCases;

public sealed class GetStudentByIdUseCase
{
    private readonly IStudentStore _store;

    public GetStudentByIdUseCase(IStudentStore store) => _store = store;

    public Task<Result<StudentDto>> ExecuteAsync(GetStudentByIdQuery query, CancellationToken ct = default)
    {
        if (query.Id == Guid.Empty)
            return Task.FromResult(Result<StudentDto>.Failure(Errors.Validation.Failed("Id is required.")));

        return _store.GetByIdAsync(query, ct);
    }
}