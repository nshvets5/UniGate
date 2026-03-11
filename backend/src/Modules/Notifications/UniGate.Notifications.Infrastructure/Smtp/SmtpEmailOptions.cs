namespace UniGate.Notifications.Infrastructure.Smtp;

public sealed class SmtpEmailOptions
{
    public string Host { get; set; } = default!;
    public int Port { get; set; } = 587;
    public bool UseStartTls { get; set; } = true;

    public string Username { get; set; } = default!;
    public string Password { get; set; } = default!;

    public string FromEmail { get; set; } = default!;
    public string FromName { get; set; } = "UniGate";

    public int TimeoutSeconds { get; set; } = 15;
}