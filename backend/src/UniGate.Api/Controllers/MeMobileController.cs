using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniGate.Api.Controllers.Base;
using UniGate.Api.Errors;
using UniGate.Devices.Application.Attempts;
using UniGate.Directory.Application.Credentials;
using UniGate.Directory.Application.Groups;
using UniGate.Directory.Application.Groups.UseCases;
using UniGate.Directory.Application.Me;
using UniGate.Directory.Application.Students;
using UniGate.Iam.Application.Me;
using UniGate.Iam.Application.UseCases.EnsureMyProfile;
using UniGate.SharedKernel.MobileCredentials;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Api.Controllers;

[Authorize]
[Route("api/me")]
public sealed class MeMobileController
    : ApiControllerBase
{
    private readonly EnsureMyProfileUseCase
        _ensureMyProfile;

    private readonly GetMyStudentUseCase
        _getMyStudent;

    private readonly ListStudentCredentialsUseCase
        _listCredentials;

    private readonly ListReaderScanAttemptsUseCase
        _listAttempts;

    private readonly GetStudentAccessSummaryUseCase
        _getAccessSummary;

    private readonly GetGroupByIdUseCase
        _getGroup;

    private readonly GetMySecurityUseCase
        _getSecurity;

    private readonly IMobileCredentialService
        _mobileCredentialService;

    public MeMobileController(
        EnsureMyProfileUseCase ensureMyProfile,
        GetMyStudentUseCase getMyStudent,
        ListStudentCredentialsUseCase listCredentials,
        ListReaderScanAttemptsUseCase listAttempts,
        GetStudentAccessSummaryUseCase getAccessSummary,
        GetGroupByIdUseCase getGroup,
        GetMySecurityUseCase getSecurity,
        IMobileCredentialService mobileCredentialService,
        IApiErrorMapper errorMapper)
        : base(errorMapper)
    {
        _ensureMyProfile = ensureMyProfile;
        _getMyStudent = getMyStudent;
        _listCredentials = listCredentials;
        _listAttempts = listAttempts;
        _getAccessSummary = getAccessSummary;
        _getGroup = getGroup;
        _getSecurity = getSecurity;
        _mobileCredentialService = mobileCredentialService;
    }

    [HttpGet("credentials")]
    public async Task<IActionResult> GetCredentials(
        CancellationToken ct)
    {
        var studentResult =
            await ResolveCurrentStudentAsync(ct);

        if (!studentResult.IsSuccess)
            return ToActionResult(studentResult);

        var credentialsResult =
            await _listCredentials.ExecuteAsync(
                studentResult.Value.Id,
                ct);

        if (!credentialsResult.IsSuccess)
            return ToActionResult(credentialsResult);

        var items = credentialsResult.Value
            .Select(MapCredential)
            .ToList();

        return Ok(items);
    }

    [HttpGet("access-attempts")]
    public async Task<IActionResult> GetAccessAttempts(
        [FromQuery] bool? isAllowed,
        [FromQuery] string? credentialType,
        [FromQuery] DateTimeOffset? fromUtc,
        [FromQuery] DateTimeOffset? toUtc,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var studentResult =
            await ResolveCurrentStudentAsync(ct);

        if (!studentResult.IsSuccess)
            return ToActionResult(studentResult);

        var attemptsResult =
            await _listAttempts.ExecuteAsync(
                new ReaderScanAttemptsQuery(
                    ReaderId: null,
                    StudentId: studentResult.Value.Id,
                    IsAllowed: isAllowed,
                    CredentialType: credentialType,
                    CredentialValue: null,
                    FromUtc: fromUtc,
                    ToUtc: toUtc,
                    Page: page,
                    PageSize: pageSize),
                ct);

        if (!attemptsResult.IsSuccess)
            return ToActionResult(attemptsResult);

        var source = attemptsResult.Value;

        var response =
            new PagedResult<MyAccessAttemptDto>(
                source.Items
                    .Select(MapAttempt)
                    .ToList(),
                source.Page,
                source.PageSize,
                source.TotalCount);

        return Ok(response);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(
        [FromQuery] int recentTake = 5,
        CancellationToken ct = default)
    {
        if (recentTake is < 1 or > 20)
        {
            return BadRequest(new
            {
                code = "validation.failed",
                message =
                    "RecentTake must be between 1 and 20."
            });
        }

        var profileResult =
            await _ensureMyProfile.ExecuteAsync(ct);

        if (!profileResult.IsSuccess)
            return ToActionResult(profileResult);

        var studentResult =
            await _getMyStudent.ExecuteAsync(
                new GetMyStudentQuery(
                    profileResult.Value.ProfileId),
                ct);

        if (!studentResult.IsSuccess)
            return ToActionResult(studentResult);

        var student = studentResult.Value;

        var groupResult =
            await _getGroup.ExecuteAsync(
                new GetGroupByIdQuery(student.GroupId),
                ct);

        if (!groupResult.IsSuccess)
            return ToActionResult(groupResult);

        var credentialsResult =
            await _listCredentials.ExecuteAsync(
                student.Id,
                ct);

        if (!credentialsResult.IsSuccess)
            return ToActionResult(credentialsResult);

        var summaryResult =
            await _getAccessSummary.ExecuteAsync(
                student.Id,
                ct);

        if (!summaryResult.IsSuccess)
            return ToActionResult(summaryResult);

        var recentResult =
            await _listAttempts.ExecuteAsync(
                new ReaderScanAttemptsQuery(
                    ReaderId: null,
                    StudentId: student.Id,
                    IsAllowed: null,
                    CredentialType: null,
                    CredentialValue: null,
                    FromUtc: null,
                    ToUtc: null,
                    Page: 1,
                    PageSize: recentTake),
                ct);

        if (!recentResult.IsSuccess)
            return ToActionResult(recentResult);

        var securityResult =
            await _getSecurity.ExecuteAsync(ct);

        if (!securityResult.IsSuccess)
            return ToActionResult(securityResult);

        var credentials = credentialsResult.Value;

        var response = new MyDashboardDto(
            Profile: new MyDashboardProfileDto(
                ProfileId:
                    profileResult.Value.ProfileId,
                DisplayName:
                    profileResult.Value.DisplayName,
                Email:
                    profileResult.Value.Email,
                EmailVerified:
                    securityResult.Value.EmailVerified),
            Student: new MyDashboardStudentDto(
                Id: student.Id,
                FullName: BuildFullName(student),
                GroupId: groupResult.Value.Id,
                GroupCode: groupResult.Value.Code,
                GroupName: groupResult.Value.Name,
                IsActive: student.IsActive),
            Credentials:
                new MyDashboardCredentialSummaryDto(
                    Total: credentials.Count,
                    Active: credentials.Count(
                        x => x.IsActive)),
            Statistics: summaryResult.Value,
            RecentAttempts: recentResult.Value.Items
                .Select(MapAttempt)
                .ToList());

        return Ok(response);
    }

    [HttpPost("mobile-credential")]
    public async Task<IActionResult> IssueMobileCredential(
    CancellationToken ct)
    {
        var studentResult =
            await ResolveCurrentStudentAsync(ct);

        if (!studentResult.IsSuccess)
            return ToActionResult(studentResult);

        var result =
            await _mobileCredentialService.IssueAsync(
                studentResult.Value.Id,
                ct);

        return ToActionResult(result);
    }

    private async Task<Result<StudentDto>>
        ResolveCurrentStudentAsync(
            CancellationToken ct)
    {
        var profileResult =
            await _ensureMyProfile.ExecuteAsync(ct);

        if (!profileResult.IsSuccess)
        {
            return Result<StudentDto>.Failure(
                profileResult.Error);
        }

        return await _getMyStudent.ExecuteAsync(
            new GetMyStudentQuery(
                profileResult.Value.ProfileId),
            ct);
    }

    private static MyCredentialDto MapCredential(
        StudentCredentialDto credential)
    {
        return new MyCredentialDto(
            Id: credential.Id,
            Type: credential.Type,
            DisplayValue:
                MaskCredentialValue(credential.Value),
            IsActive: credential.IsActive,
            CreatedAt: credential.CreatedAt);
    }

    private static MyAccessAttemptDto MapAttempt(
        ReaderScanAttemptDto attempt)
    {
        return new MyAccessAttemptDto(
            Id: attempt.Id,
            ReaderId: attempt.ReaderId,
            CredentialType: attempt.CredentialType,
            IsAllowed: attempt.IsAllowed,
            ReasonCode: attempt.ReasonCode,
            OccurredAt: attempt.OccurredAt);
    }

    private static string MaskCredentialValue(
        string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return "••••";

        var visibleLength =
            Math.Min(4, value.Length);

        return $"••••{value[^visibleLength..]}";
    }

    private static string BuildFullName(
        StudentDto student)
    {
        return string.Join(
            " ",
            new[]
            {
                student.LastName,
                student.FirstName,
                student.MiddleName
            }
            .Where(
                x => !string.IsNullOrWhiteSpace(x)));
    }
}

public sealed record MyCredentialDto(
    Guid Id,
    string Type,
    string DisplayValue,
    bool IsActive,
    DateTimeOffset CreatedAt);

public sealed record MyAccessAttemptDto(
    Guid Id,
    Guid ReaderId,
    string CredentialType,
    bool IsAllowed,
    string ReasonCode,
    DateTimeOffset OccurredAt);

public sealed record MyDashboardProfileDto(
    Guid ProfileId,
    string? DisplayName,
    string? Email,
    bool EmailVerified);

public sealed record MyDashboardStudentDto(
    Guid Id,
    string FullName,
    Guid GroupId,
    string GroupCode,
    string GroupName,
    bool IsActive);

public sealed record MyDashboardCredentialSummaryDto(
    int Total,
    int Active);

public sealed record MyDashboardDto(
    MyDashboardProfileDto Profile,
    MyDashboardStudentDto Student,
    MyDashboardCredentialSummaryDto Credentials,
    StudentAccessSummaryDto Statistics,
    IReadOnlyList<MyAccessAttemptDto> RecentAttempts);