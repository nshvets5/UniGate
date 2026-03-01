namespace UniGate.Directory.Application.Groups;

public sealed record ListGroupsQuery(
    string? Search,
    bool? IsActive,
    int Page,
    int PageSize);