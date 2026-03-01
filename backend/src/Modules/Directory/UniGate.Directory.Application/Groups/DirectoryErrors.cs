using UniGate.SharedKernel.Results;

namespace UniGate.Directory.Application.Groups;

public static class DirectoryErrors
{
    public static class Groups
    {
        public static readonly Error DuplicateCode =
            new("groups.duplicate_code", "A group with the same code already exists.");

        public static readonly Error NotFound =
            new("groups.not_found", "Group not found.");
    }
}