namespace UniGate.Directory.Domain;

public sealed class Student
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public Guid GroupId { get; private set; }

    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string? MiddleName { get; private set; }

    public string Email { get; private set; } = default!;

    public Guid? IamProfileId { get; private set; }

    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private Student() { }

    public Student(Guid groupId, string firstName, string lastName, string? middleName, string email)
    {
        GroupId = groupId;
        FirstName = firstName;
        LastName = lastName;
        MiddleName = middleName;
        Email = email;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Rename(string firstName, string lastName, string? middleName)
    {
        FirstName = firstName;
        LastName = lastName;
        MiddleName = middleName;
    }

    public void ChangeEmail(string email) => Email = email;

    public void ChangeGroup(Guid groupId) => GroupId = groupId;

    public void SetActive(bool isActive) => IsActive = isActive;

    public void BindIamProfile(Guid profileId) => IamProfileId = profileId;
}