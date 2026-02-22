namespace UniGate.Iam.Domain;

public sealed class UserProfile
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string? Email { get; private set; }
    public string? DisplayName { get; private set; }

    public UserStatus Status { get; private set; } = UserStatus.Active;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private UserProfile() { }

    public UserProfile(string? email, string? displayName)
    {
        Email = email;
        DisplayName = displayName;
        Status = UserStatus.Active;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Block() => Status = UserStatus.Blocked;
    public void Activate() => Status = UserStatus.Active;

    public void UpdateProfile(string? email, string? displayName)
    {
        Email = email;
        DisplayName = displayName;
    }
}
