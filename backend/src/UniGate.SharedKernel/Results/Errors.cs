namespace UniGate.SharedKernel.Results;

public static class Errors
{
    public static class Auth
    {
        public static readonly Error Unauthorized =
            new("auth.unauthorized", "Unauthorized.");

        public static readonly Error MissingSubject =
            new("auth.missing_subject", "Missing 'sub' claim in access token.");
    }

    public static class Validation
    {
        public static Error Failed(string message) => new("validation.failed", message);
    }

    public static class Infrastructure
    {
        public static readonly Error Misconfigured =
            new("infra.misconfigured", "Required configuration is missing or invalid.");
    }
}
