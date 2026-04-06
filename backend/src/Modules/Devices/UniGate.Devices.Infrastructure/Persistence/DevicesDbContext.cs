using Microsoft.EntityFrameworkCore;
using UniGate.Devices.Domain;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Devices.Infrastructure.Persistence;

public sealed class DevicesDbContext : DbContext
{
    public DevicesDbContext(DbContextOptions<DevicesDbContext> options) : base(options) { }

    public DbSet<ReaderDevice> ReaderDevices => Set<ReaderDevice>();
    public DbSet<ReaderScanAttempt> ReaderScanAttempts => Set<ReaderScanAttempt>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("devices");

        modelBuilder.Entity<ReaderDevice>(b =>
        {
            b.ToTable("reader_devices");
            b.HasKey(x => x.Id);

            b.Property(x => x.Code).HasMaxLength(100).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.DoorId).IsRequired();
            b.Property(x => x.Type).HasConversion<int>().IsRequired();
            b.Property(x => x.IsActive).IsRequired();
            b.Property(x => x.ApiKeyHash).HasMaxLength(500);
            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.LastSeenAt);
            b.Property(x => x.LastOfflineAlertAt);

            b.HasIndex(x => x.Code).IsUnique();
            b.HasIndex(x => x.DoorId);
        });

        modelBuilder.Entity<ReaderScanAttempt>(b =>
        {
            b.ToTable("reader_scan_attempts");
            b.HasKey(x => x.Id);

            b.Property(x => x.ReaderId).IsRequired();
            b.Property(x => x.CredentialType).HasMaxLength(30).IsRequired();
            b.Property(x => x.CredentialValue).HasMaxLength(300).IsRequired();
            b.Property(x => x.CredentialId);
            b.Property(x => x.StudentId);
            b.Property(x => x.IsAllowed).IsRequired();
            b.Property(x => x.ReasonCode).HasMaxLength(100).IsRequired();
            b.Property(x => x.OccurredAt).IsRequired();

            b.HasIndex(x => x.ReaderId);
            b.HasIndex(x => x.OccurredAt);
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