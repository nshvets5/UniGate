using Microsoft.EntityFrameworkCore;
using UniGate.Directory.Domain;

namespace UniGate.Directory.Infrastructure.Persistence;

public sealed class DirectoryDbContext : DbContext
{
    public DirectoryDbContext(DbContextOptions<DirectoryDbContext> options) : base(options) { }

    public DbSet<Group> Groups => Set<Group>();

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
    }
}