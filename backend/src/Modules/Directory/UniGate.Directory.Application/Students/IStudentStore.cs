using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Students;

public interface IStudentStore
{
    Task<Result<Guid>> CreateAsync(CreateStudentCommand cmd, CancellationToken ct = default);

    Task<Result<PagedResult<StudentDto>>> ListAsync(ListStudentsQuery query, CancellationToken ct = default);

    Task<Result<StudentDto>> GetByIdAsync(GetStudentByIdQuery query, CancellationToken ct = default);

    Task<Result> UpdateAsync(UpdateStudentCommand cmd, CancellationToken ct = default);

    Task<Result> SetActiveAsync(SetStudentActiveCommand cmd, CancellationToken ct = default);

    Task<Result> ChangeGroupAsync(ChangeStudentGroupCommand cmd, CancellationToken ct = default);

    Task<Result> BindProfileAsync(BindStudentProfileCommand cmd, CancellationToken ct = default);
}