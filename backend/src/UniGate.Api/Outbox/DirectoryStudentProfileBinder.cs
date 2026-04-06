using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using UniGate.Directory.Infrastructure.Persistence;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Outbox;

namespace UniGate.Api.Outbox;

public sealed class DirectoryStudentProfileBinder
{
    private readonly DirectoryDbContext _directoryDb;
    private readonly IProfileLookup _profileLookup;

    public DirectoryStudentProfileBinder(
        DirectoryDbContext directoryDb,
        IProfileLookup profileLookup)
    {
        _directoryDb = directoryDb;
        _profileLookup = profileLookup;
    }

    public async Task TryAutoBindByEmailAsync(
        Guid profileId,
        string email,
        string? actorProvider,
        string? actorSubject,
        string? correlationId,
        string? traceId,
        CancellationToken ct)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();

        var student = await _directoryDb.Students
            .FirstOrDefaultAsync(x => x.Email == normalizedEmail, ct);

        if (student is null)
            return;

        if (student.IamProfileId == profileId)
            return;

        if (student.IamProfileId is not null && student.IamProfileId != profileId)
            return;

        student.BindIamProfile(profileId);

        var payload = JsonSerializer.Serialize(new
        {
            studentId = student.Id,
            student.GroupId,
            student.FirstName,
            student.LastName,
            student.MiddleName,
            student.Email,
            student.IamProfileId,
            student.IsActive,
            actorProvider,
            actorSubject,
            occurredAt = DateTimeOffset.UtcNow
        });

        _directoryDb.OutboxMessages.Add(new OutboxMessage(
            type: DirectoryOutboxTypes.StudentProfileBound,
            payloadJson: payload,
            correlationId: correlationId,
            traceId: traceId));

        await _directoryDb.SaveChangesAsync(ct);
    }

    public async Task TryBindForStudentEventAsync(OutboxMessage msg, CancellationToken ct)
    {
        using var doc = JsonDocument.Parse(msg.PayloadJson);
        var root = doc.RootElement;

        var studentId = root.GetProperty("studentId").GetGuid();

        var email = root.TryGetProperty("Email", out var em) ? em.GetString() : null;
        if (string.IsNullOrWhiteSpace(email))
            return;

        var normalizedEmail = email.Trim().ToLowerInvariant();

        var student = await _directoryDb.Students.FirstOrDefaultAsync(x => x.Id == studentId, ct);
        if (student is null)
            return;

        if (student.IamProfileId is not null)
            return;

        var lookup = await _profileLookup.FindProfileIdByEmailAsync(normalizedEmail, ct);
        if (!lookup.IsSuccess)
            throw new InvalidOperationException($"Profile lookup failed: {lookup.Error.Code}");

        if (lookup.Value is not Guid profileId)
            return;

        student.BindIamProfile(profileId);

        var actorProvider = root.TryGetProperty("actorProvider", out var ap) ? ap.GetString() : null;
        var actorSubject = root.TryGetProperty("actorSubject", out var asu) ? asu.GetString() : null;

        var payload = JsonSerializer.Serialize(new
        {
            studentId = student.Id,
            student.GroupId,
            student.FirstName,
            student.LastName,
            student.MiddleName,
            student.Email,
            student.IamProfileId,
            student.IsActive,
            actorProvider,
            actorSubject,
            occurredAt = DateTimeOffset.UtcNow
        });

        _directoryDb.OutboxMessages.Add(new OutboxMessage(
            type: DirectoryOutboxTypes.StudentProfileBound,
            payloadJson: payload,
            correlationId: msg.CorrelationId,
            traceId: msg.TraceId));

        await _directoryDb.SaveChangesAsync(ct);
    }
}