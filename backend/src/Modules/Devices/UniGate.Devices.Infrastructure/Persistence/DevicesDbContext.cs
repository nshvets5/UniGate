using Microsoft.EntityFrameworkCore;
using UniGate.Devices.Domain;

namespace UniGate.Devices.Infrastructure.Persistence;

public sealed class DevicesDbContext : DbContext
{
    public DevicesDbContext(DbContextOptions<DevicesDbContext> options) : base(options) { }

    public DbSet<ReaderDevice> ReaderDevices => Set<ReaderDevice>();

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

            b.HasIndex(x => x.Code).IsUnique();
            b.HasIndex(x => x.DoorId);
        });
    }
}