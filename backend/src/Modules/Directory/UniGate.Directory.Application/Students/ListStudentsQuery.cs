namespace UniGate.Directory.Application.Students;

public sealed record ListStudentsQuery(
    Guid? GroupId,
    string? Search,
    bool? IsActive,
    int Page,
    int PageSize);