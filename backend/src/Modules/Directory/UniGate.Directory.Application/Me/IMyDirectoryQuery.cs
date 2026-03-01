using UniGate.Directory.Application.Students;
using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Me;

public interface IMyDirectoryQuery
{
    Task<Result<StudentDto>> GetStudentByProfileIdAsync(GetMyStudentQuery query, CancellationToken ct = default);
}