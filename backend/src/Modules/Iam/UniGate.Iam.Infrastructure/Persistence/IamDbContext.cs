using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;
using UniGate.Iam.Domain;

namespace UniGate.Iam.Infrastructure.Persistence;

public sealed class IamDbContext : DbContext
{
    public IamDbContext(DbContextOptions<IamDbContext> options) : base(options) { }

    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<ExternalIdentity> ExternalIdentities => Set<ExternalIdentity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("iam");

        modelBuilder.Entity<UserProfile>(b =>
        {
            b.ToTable("user_profiles");
            b.HasKey(x => x.Id);

            b.Property(x => x.Email).HasMaxLength(320);
            b.Property(x => x.DisplayName).HasMaxLength(200);

            b.Property(x => x.Status).HasConversion<int>();
            b.Property(x => x.CreatedAt);
        });

        modelBuilder.Entity<ExternalIdentity>(b =>
        {
            b.ToTable("external_identities");
            b.HasKey(x => x.Id);

            b.Property(x => x.Provider).HasMaxLength(50).IsRequired();
            b.Property(x => x.Subject).HasMaxLength(200).IsRequired();
            b.Property(x => x.CreatedAt);

            b.HasOne(x => x.UserProfile)
                .WithMany()
                .HasForeignKey(x => x.UserProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(x => new { x.Provider, x.Subject }).IsUnique();
        });
    }
}
