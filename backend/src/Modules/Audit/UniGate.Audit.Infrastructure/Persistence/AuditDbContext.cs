using Microsoft.EntityFrameworkCore;
using UniGate.Audit.Domain;

namespace UniGate.Audit.Infrastructure.Persistence;

public sealed class AuditDbContext : DbContext
{
    public AuditDbContext(DbContextOptions<AuditDbContext> options) : base(options) { }

    public DbSet<AuditEvent> AuditEvents => Set<AuditEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("audit");

        modelBuilder.Entity<AuditEvent>(b =>
        {
            b.ToTable("events");
            b.HasKey(x => x.Id);

            b.Property(x => x.OccurredAt).IsRequired();
            b.Property(x => x.Type).HasMaxLength(200).IsRequired();

            b.Property(x => x.ActorProvider).HasMaxLength(50);
            b.Property(x => x.ActorSubject).HasMaxLength(200);

            b.Property(x => x.ResourceType).HasMaxLength(100);
            b.Property(x => x.ResourceId).HasMaxLength(200);

            b.Property(x => x.CorrelationId).HasMaxLength(64);
            b.Property(x => x.TraceId).HasMaxLength(128);

            b.Property(x => x.Ip).HasMaxLength(64);
            b.Property(x => x.UserAgent).HasMaxLength(512);

            b.Property(x => x.DataJson).HasColumnType("jsonb");

            b.Property(x => x.SourceMessageId);

            b.HasIndex(x => x.OccurredAt);
            b.HasIndex(x => x.Type);
            b.HasIndex(x => new { x.ActorProvider, x.ActorSubject });
            b.HasIndex(x => x.SourceMessageId).IsUnique();

        });
    }
}
