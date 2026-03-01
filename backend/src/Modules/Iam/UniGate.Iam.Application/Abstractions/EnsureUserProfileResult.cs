namespace UniGate.Iam.Application.Abstractions;

public sealed record EnsureUserProfileResult(Guid ProfileId, bool Created);
