using Microsoft.EntityFrameworkCore;
using UniGate.Access.Domain;

namespace UniGate.Access.Infrastructure.Persistence;

public sealed class AccessDbContext : DbContext
{
    public AccessDbContext(DbContextOptions<AccessDbContext> options) : base(options) { }

    public DbSet<Zone> Zones => Set<Zone>();
    public DbSet<Door> Doors => Set<Door>();
    public DbSet<AccessRule> Rules => Set<AccessRule>();

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

            b.HasIndex(x => new { x.ZoneId, x.GroupId }).IsUnique();
            b.HasIndex(x => x.GroupId);

            b.HasOne<Zone>()
                .WithMany()
                .HasForeignKey(x => x.ZoneId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}