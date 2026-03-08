using Microsoft.EntityFrameworkCore;
using UniGate.Timetable.Domain;

namespace UniGate.Timetable.Infrastructure.Persistence;

public sealed class TimetableDbContext : DbContext
{
    public TimetableDbContext(DbContextOptions<TimetableDbContext> options) : base(options) { }

    public DbSet<TimetableSlot> Slots => Set<TimetableSlot>();
    public DbSet<TimetableImportBatch> ImportBatches => Set<TimetableImportBatch>();
    public DbSet<TimetableImportPreview> ImportPreviews => Set<TimetableImportPreview>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("timetable");

        modelBuilder.Entity<TimetableImportBatch>(b =>
        {
            b.ToTable("import_batches");
            b.HasKey(x => x.Id);

            b.Property(x => x.SourceType).HasMaxLength(20).IsRequired();
            b.Property(x => x.SourceFileName).HasMaxLength(255);

            b.Property(x => x.ImportedByProvider).HasMaxLength(50);
            b.Property(x => x.ImportedBySubject).HasMaxLength(200);

            b.Property(x => x.TotalRows).IsRequired();
            b.Property(x => x.ImportedRows).IsRequired();
            b.Property(x => x.SkippedRows).IsRequired();

            b.Property(x => x.IsActive).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();

            b.HasIndex(x => x.CreatedAt);
            b.HasIndex(x => x.IsActive);
        });

        modelBuilder.Entity<TimetableSlot>(b =>
        {
            b.ToTable("slots");
            b.HasKey(x => x.Id);

            b.Property(x => x.BatchId).IsRequired();
            b.Property(x => x.GroupId).IsRequired();
            b.Property(x => x.ZoneId).IsRequired();
            b.Property(x => x.DayOfWeekIso).IsRequired();
            b.Property(x => x.StartTime).IsRequired();
            b.Property(x => x.EndTime).IsRequired();

            b.Property(x => x.ValidFrom);
            b.Property(x => x.ValidTo);

            b.Property(x => x.Title).HasMaxLength(200);
            b.Property(x => x.IsActive).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();

            b.HasIndex(x => x.BatchId);
            b.HasIndex(x => new { x.GroupId, x.ZoneId, x.DayOfWeekIso, x.StartTime, x.EndTime });

            b.HasOne<TimetableImportBatch>()
                .WithMany()
                .HasForeignKey(x => x.BatchId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TimetableImportPreview>(b =>
        {
            b.ToTable("import_previews");
            b.HasKey(x => x.Id);

            b.Property(x => x.Token).HasMaxLength(64).IsRequired();
            b.Property(x => x.SourceType).HasMaxLength(20).IsRequired();
            b.Property(x => x.SourceFileName).HasMaxLength(255);

            b.Property(x => x.ImportedByProvider).HasMaxLength(50);
            b.Property(x => x.ImportedBySubject).HasMaxLength(200);

            b.Property(x => x.PayloadJson).HasColumnType("jsonb").IsRequired();

            b.Property(x => x.TotalRows).IsRequired();
            b.Property(x => x.SkippedRows).IsRequired();

            b.Property(x => x.ExpiresAt).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.AppliedAt);

            b.HasIndex(x => x.Token).IsUnique();
            b.HasIndex(x => x.ExpiresAt);
            b.HasIndex(x => x.AppliedAt);
        });
    }
}