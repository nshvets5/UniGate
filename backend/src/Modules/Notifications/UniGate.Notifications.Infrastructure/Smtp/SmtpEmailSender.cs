using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using UniGate.Notifications.Application;

namespace UniGate.Notifications.Infrastructure.Smtp;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly SmtpEmailOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<SmtpEmailOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task<EmailSenderResult> SendAsync(EmailMessageDto message, CancellationToken ct = default)
    {
        try
        {
            using var mail = new MailMessage
            {
                From = new MailAddress(_options.FromEmail, _options.FromName),
                Subject = message.Subject,
                Body = message.Body,
                IsBodyHtml = message.IsHtml
            };

            mail.To.Add(message.ToEmail);

            using var client = new SmtpClient(_options.Host, _options.Port)
            {
                EnableSsl = _options.UseStartTls,
                Credentials = new NetworkCredential(_options.Username, _options.Password),
                Timeout = _options.TimeoutSeconds * 1000
            };

            using var reg = ct.Register(() => client.SendAsyncCancel());
            await client.SendMailAsync(mail);

            return new EmailSenderResult(true, null);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SMTP send failed to {ToEmail}", message.ToEmail);
            return new EmailSenderResult(false, ex.Message);
        }
    }
}