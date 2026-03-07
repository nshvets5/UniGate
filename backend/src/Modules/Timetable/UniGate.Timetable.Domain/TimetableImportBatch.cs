namespace UniGate.Timetable.Domain;

public sealed class TimetableImportBatch
{
    public Guid Id { get; private set; } = Guid.NewGuid();

    public string SourceType { get; private set; } = default!; // csv / ics
    public string? SourceFileName { get; private set; }

    public string? ImportedByProvider { get; private set; }
    public string? ImportedBySubject { get; private set; }

    public int TotalRows { get; private set; }
    public int ImportedRows { get; private set; }
    public int SkippedRows { get; private set; }

    public bool IsActive { get; private set; } = false;

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    private TimetableImportBatch() { }

    public TimetableImportBatch(
        string sourceType,
        string? sourceFileName,
        string? importedByProvider,
        string? importedBySubject,
        int totalRows,
        int importedRows,
        int skippedRows)
    {
        SourceType = sourceType;
        SourceFileName = sourceFileName;
        ImportedByProvider = importedByProvider;
        ImportedBySubject = importedBySubject;
        TotalRows = totalRows;
        ImportedRows = importedRows;
        SkippedRows = skippedRows;
        CreatedAt = DateTimeOffset.UtcNow;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}