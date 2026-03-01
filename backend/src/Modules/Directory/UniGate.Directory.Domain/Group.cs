namespace UniGate.Directory.Domain;

public sealed class Group
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Code { get; private set; } = default!;  // e.g. "PZPI-22-5"
    public string Name { get; private set; } = default!;  // e.g. "ПЗПІ-22-5"
    public int AdmissionYear { get; private set; }
    public bool IsActive { get; private set; } = true;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private Group() { }

    public Group(string code, string name, int admissionYear)
    {
        Code = code;
        Name = name;
        AdmissionYear = admissionYear;
        IsActive = true;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Rename(string name) => Name = name;

    public void ChangeCode(string code) => Code = code;

    public void SetActive(bool isActive) => IsActive = isActive;

    public void SetAdmissionYear(int year) => AdmissionYear = year;
}