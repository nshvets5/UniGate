using Microsoft.EntityFrameworkCore;
using UniGate.Access.Domain;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Access.Infrastructure.Persistence;

public sealed class AccessDbContext : DbContext
{
    public AccessDbContext(DbContextOptions<AccessDbContext> options) : base(options) { }

    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<Door> Doors => Set<Door>();
    public DbSet<AccessRule> Rules => Set<AccessRule>();
    public DbSet<RuleWindow> RuleWindows => Set<RuleWindow>();
    public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("access");

        modelBuilder.Entity<Zone>(b =>
        {
            b.ToTable("zones");
            b.HasKey(x => x.Id);
            b.Property(x => x.Code).HasMaxLength(50).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.IsActive).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();
            b.HasIndex(x => x.Code).IsUnique();
        });

        modelBuilder.Entity<Door>(b =>
        {
            b.ToTable("doors");
            b.HasKey(x => x.Id);
            b.Property(x => x.ZoneId).IsRequired();
            b.Property(x => x.Code).HasMaxLength(50).IsRequired();
            b.Property(x => x.Name).HasMaxLength(200).IsRequired();
            b.Property(x => x.IsActive).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();
            b.HasIndex(x => x.Code).IsUnique();
            b.HasIndex(x => x.ZoneId);

            b.HasOne<Zone>()
                .WithMany()
                .HasForeignKey(x => x.ZoneId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AccessRule>(b =>
        {
            b.ToTable("rules");
            b.HasKey(x => x.Id);
            b.Property(x => x.ZoneId).IsRequired();
            b.Property(x => x.GroupId).IsRequired();
            b.Property(x => x.IsActive).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();

            b.Property(x => x.ValidFrom);
            b.Property(x => x.ValidTo);

            b.HasIndex(x => new { x.ZoneId, x.GroupId }).IsUnique();
            b.HasIndex(x => x.GroupId);

            b.HasOne<Zone>()
                .WithMany()
                .HasForeignKey(x => x.ZoneId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RuleWindow>(b =>
        {
            b.ToTable("rule_windows");
            b.HasKey(x => x.Id);

            b.Property(x => x.RuleId).IsRequired();
            b.Property(x => x.DayOfWeekIso).IsRequired();
            b.Property(x => x.StartTime).IsRequired();
            b.Property(x => x.EndTime).IsRequired();

            b.Property(x => x.IsActive).IsRequired();
            b.Property(x => x.CreatedAt).IsRequired();

            b.HasIndex(x => new { x.RuleId, x.DayOfWeekIso, x.StartTime, x.EndTime }).IsUnique();

            b.HasOne<AccessRule>()
                .WithMany()
                .HasForeignKey(x => x.RuleId)
                .OnDelete(DeleteBehavior.Cascade);
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