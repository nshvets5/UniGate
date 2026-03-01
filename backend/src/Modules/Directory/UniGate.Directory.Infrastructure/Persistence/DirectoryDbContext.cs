using Microsoft.EntityFrameworkCore;
using UniGate.Directory.Domain;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Directory.Infrastructure.Persistence;

public sealed class DirectoryDbContext : DbContext
{
    public DirectoryDbContext(DbContextOptions<DirectoryDbContext> options) : base(options) { }

    public DbSet<Group> Groups => Set<Group>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("directory");

        modelBuilder.Entity<Group>(b =>
        {
            b.ToTable("groups");
            b.HasKey(x => x.Id);

            b.Property(x => x.Code).HasMaxLength(50).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.AdmissionYear).IsRequired();
            b.Property(x => x.IsActive).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();

            b.HasIndex(x => x.Code).IsUnique();
            b.HasIndex(x => x.Name);
            b.HasIndex(x => x.AdmissionYear);
        });

        modelBuilder.Entity<OutboxMessage>(b =>
        {
            b.ToTable("messages", "outbox", tb => tb.ExcludeFromMigrations());
            b.HasKey(x => x.Id);

            b.Property(x => x.Id);

            b.Property(x => x.OccurredAt).IsRequired();
            b.Property(x => x.Type).HasMaxLength(200).IsRequired();
            b.Property(x => x.PayloadJson).HasColumnType("jsonb").IsRequired();

            b.Property(x => x.CorrelationId).HasMaxLength(64);
            b.Property(x => x.TraceId).HasMaxLength(128);

            b.Property(x => x.Attempts).IsRequired();
            b.Property(x => x.LastError).HasMaxLength(2000);

            b.Property(x => x.AvailableAt).IsRequired();
            b.Property(x => x.ProcessedAt);

            b.Property(x => x.DeadLetteredAt);
            b.Property(x => x.DeadLetterReason).HasMaxLength(2000);
        });
    }
}