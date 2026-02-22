namespace UniGate.Iam.Domain;

public sealed class ExternalIdentity
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Provider { get; private set; } = default!;
    public string Subject { get; private set; } = default!;

    public Guid UserProfileId { get; private set; }
    public UserProfile UserProfile { get; private set; } = default!;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private ExternalIdentity() { }

    public ExternalIdentity(string provider, string subject, Guid userProfileId)
    {
        Provider = provider;
        Subject = subject;
        UserProfileId = userProfileId;
        CreatedAt = DateTimeOffset.UtcNow;
    }
}
