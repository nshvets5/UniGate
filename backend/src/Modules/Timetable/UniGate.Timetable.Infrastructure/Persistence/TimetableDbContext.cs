using Microsoft.EntityFrameworkCore;
using UniGate.Timetable.Domain;

namespace UniGate.Timetable.Infrastructure.Persistence;

public sealed class TimetableDbContext : DbContext
{
    public TimetableDbContext(DbContextOptions<TimetableDbContext> options) : base(options) { }

    public DbSet<TimetableSlot> Slots => Set<TimetableSlot>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("timetable");

        modelBuilder.Entity<TimetableSlot>(b =>
        {
            b.ToTable("slots");
            b.HasKey(x => x.Id);

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

            b.HasIndex(x => new { x.GroupId, x.ZoneId, x.DayOfWeekIso, x.StartTime, x.EndTime });
        });
    }
}