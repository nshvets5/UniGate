namespace UniGate.Timetable.Domain;

public sealed class TimetableImportPreview
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string Token { get; private set; } = default!;

    public string SourceType { get; private set; } = default!;
    public string? SourceFileName { get; private set; }

    public string? ImportedByProvider { get; private set; }
    public string? ImportedBySubject { get; private set; }

    public string PayloadJson { get; private set; } = default!;

    public int TotalRows { get; private set; }
    public int SkippedRows { get; private set; }

    public DateTimeOffset ExpiresAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AppliedAt { get; private set; }

    private TimetableImportPreview() { }

    public TimetableImportPreview(
        string token,
        string sourceType,
        string? sourceFileName,
        string? importedByProvider,
        string? importedBySubject,
        string payloadJson,
        int totalRows,
        int skippedRows,
        DateTimeOffset expiresAt)
    {
        Token = token;
        SourceType = sourceType;
        SourceFileName = sourceFileName;
        ImportedByProvider = importedByProvider;
        ImportedBySubject = importedBySubject;
        PayloadJson = payloadJson;
        TotalRows = totalRows;
        SkippedRows = skippedRows;
        ExpiresAt = expiresAt;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public bool IsExpired(DateTimeOffset nowUtc) => ExpiresAt <= nowUtc;

    public bool IsApplied => AppliedAt is not null;

    public void MarkApplied()
    {
        if (AppliedAt is null)
            AppliedAt = DateTimeOffset.UtcNow;
    }
}