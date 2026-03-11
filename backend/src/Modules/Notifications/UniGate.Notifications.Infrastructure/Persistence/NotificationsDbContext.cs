using Microsoft.EntityFrameworkCore;
using UniGate.Notifications.Domain;

namespace UniGate.Notifications.Infrastructure.Persistence;

public sealed class NotificationsDbContext : DbContext
{
    public NotificationsDbContext(DbContextOptions<NotificationsDbContext> options) : base(options) { }

    public DbSet<NotificationMessage> Notifications => Set<NotificationMessage>();
    public DbSet<EmailDeliveryAttempt> DeliveryAttempts => Set<EmailDeliveryAttempt>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("notifications");

        modelBuilder.Entity<NotificationMessage>(b =>
        {
            b.ToTable("messages");
            b.HasKey(x => x.Id);

            b.Property(x => x.Channel).HasMaxLength(20).IsRequired();
            b.Property(x => x.ToEmail).HasMaxLength(320).IsRequired();
            b.Property(x => x.Subject).HasMaxLength(500).IsRequired();
            b.Property(x => x.Body).HasColumnType("text").IsRequired();
            b.Property(x => x.IsHtml).IsRequired();

            b.Property(x => x.Status).HasConversion<int>().IsRequired();
            b.Property(x => x.Attempts).IsRequired();
            b.Property(x => x.LastError).HasMaxLength(2000);

            b.Property(x => x.CreatedAt).IsRequired();
            b.Property(x => x.SentAt);
            b.Property(x => x.LastAttemptAt);
            b.Property(x => x.AvailableAt).IsRequired();

            b.HasIndex(x => new { x.Status, x.AvailableAt });
            b.HasIndex(x => x.CreatedAt);
        });

        modelBuilder.Entity<EmailDeliveryAttempt>(b =>
        {
            b.ToTable("delivery_attempts");
            b.HasKey(x => x.Id);

            b.Property(x => x.NotificationId).IsRequired();
            b.Property(x => x.IsSuccess).IsRequired();
            b.Property(x => x.Error).HasMaxLength(2000);
            b.Property(x => x.CreatedAt).IsRequired();

            b.HasIndex(x => x.NotificationId);
        });
    }
}