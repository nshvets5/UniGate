using System.Globalization;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.MobileCredentials;
using UniGate.SharedKernel.Results;

namespace UniGate.Api.MobileCredentials;

public sealed class JwtMobileCredentialService
    : IMobileCredentialService
{
    private const string StudentIdClaim = "student_id";
    private const string TokenTypeClaim = "credential_type";

    private readonly MobileCredentialOptions _options;
    private readonly IMobileCredentialTokenStore _tokenStore;
    private readonly IStudentLookup _students;
    private readonly JsonWebTokenHandler _tokenHandler;
    private readonly SymmetricSecurityKey _signingKey;

    public JwtMobileCredentialService(
        IOptions<MobileCredentialOptions> options,
        IMobileCredentialTokenStore tokenStore,
        IStudentLookup students)
    {
        _options = options.Value;
        _tokenStore = tokenStore;
        _students = students;

        ValidateOptions(_options);

        _tokenHandler = new JsonWebTokenHandler();

        _signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_options.SigningKey));
    }

    public async Task<Result<IssuedMobileCredential>> IssueAsync(
        Guid studentId,
        CancellationToken ct = default)
    {
        if (studentId == Guid.Empty)
        {
            return Result<IssuedMobileCredential>.Failure(
                UniGate.SharedKernel.Results.Errors.Validation.Failed(
                    "StudentId is required."));
        }

        var studentResult =
            await _students.FindByIdAsync(studentId, ct);

        if (!studentResult.IsSuccess)
        {
            return Result<IssuedMobileCredential>.Failure(
                studentResult.Error);
        }

        var now = DateTimeOffset.UtcNow;

        var expiresAt = now.AddSeconds(
            _options.LifetimeSeconds);

        var refreshAfter = now.AddSeconds(
            Math.Min(
                _options.RefreshAfterSeconds,
                _options.LifetimeSeconds - 1));

        var tokenId = Guid.NewGuid();

        var claims = new Dictionary<string, object>
        {
            [JwtRegisteredClaimNames.Sub] =
                studentId.ToString(),

            [JwtRegisteredClaimNames.Jti] =
                tokenId.ToString(),

            [StudentIdClaim] =
                studentId.ToString(),

            [TokenTypeClaim] =
                MobileCredentialTypes.MobileQr,

            [JwtRegisteredClaimNames.Iat] =
                now.ToUnixTimeSeconds()
        };

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,

            Claims = claims,

            NotBefore = now.UtcDateTime,
            IssuedAt = now.UtcDateTime,
            Expires = expiresAt.UtcDateTime,

            SigningCredentials = new SigningCredentials(
                _signingKey,
                SecurityAlgorithms.HmacSha256)
        };

        var token = _tokenHandler.CreateToken(descriptor);

        var saveResult = await _tokenStore.CreateAsync(
            new MobileCredentialTokenRecord(
                TokenId: tokenId,
                StudentId: studentId,
                IssuedAt: now,
                ExpiresAt: expiresAt),
            ct);

        if (!saveResult.IsSuccess)
        {
            return Result<IssuedMobileCredential>.Failure(
                saveResult.Error);
        }

        return Result<IssuedMobileCredential>.Success(
            new IssuedMobileCredential(
                Token: token,
                IssuedAt: now,
                ExpiresAt: expiresAt,
                RefreshAfter: refreshAfter));
    }

    public async Task<Result<ValidatedMobileCredential>>
        ValidateAndConsumeAsync(
            string token,
            CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return Result<ValidatedMobileCredential>.Failure(
                UniGate.SharedKernel.Results.Errors.Validation.Failed(
                    "Mobile credential token is required."));
        }

        var validationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = _options.Issuer,

                ValidateAudience = true,
                ValidAudience = _options.Audience,

                ValidateLifetime = true,

                ValidateIssuerSigningKey = true,
                IssuerSigningKey = _signingKey,

                ClockSkew = TimeSpan.FromSeconds(
                    _options.ClockSkewSeconds)
            };

        TokenValidationResult validationResult;

        try
        {
            validationResult =
                await _tokenHandler.ValidateTokenAsync(
                    token,
                    validationParameters);
        }
        catch
        {
            return InvalidToken(
                "Mobile credential token is invalid.");
        }

        if (!validationResult.IsValid ||
            validationResult.ClaimsIdentity is null)
        {
            return InvalidToken(
                "Mobile credential token is invalid or expired.");
        }

        var identity = validationResult.ClaimsIdentity;

        var credentialType =
            identity.FindFirst(TokenTypeClaim)?.Value;

        if (!string.Equals(
                credentialType,
                MobileCredentialTypes.MobileQr,
                StringComparison.Ordinal))
        {
            return InvalidToken(
                "Unsupported mobile credential token type.");
        }

        var tokenIdText =
            identity.FindFirst(
                JwtRegisteredClaimNames.Jti)?.Value;

        var studentIdText =
            identity.FindFirst(StudentIdClaim)?.Value
            ?? identity.FindFirst(
                JwtRegisteredClaimNames.Sub)?.Value;

        if (!Guid.TryParse(tokenIdText, out var tokenId) ||
            !Guid.TryParse(studentIdText, out var studentId))
        {
            return InvalidToken(
                "Mobile credential token claims are invalid.");
        }

        var studentResult =
            await _students.FindByIdAsync(studentId, ct);

        if (!studentResult.IsSuccess)
        {
            return Result<ValidatedMobileCredential>.Failure(
                studentResult.Error);
        }

        var now = DateTimeOffset.UtcNow;

        var consumeResult =
            await _tokenStore.ConsumeAsync(
                tokenId,
                studentId,
                now,
                ct);

        if (!consumeResult.IsSuccess)
        {
            return Result<ValidatedMobileCredential>.Failure(
                consumeResult.Error);
        }

        if (!consumeResult.Value)
        {
            return Result<ValidatedMobileCredential>.Failure(
                new Error(
                    "mobile_credential.already_used_or_expired",
                    "Mobile credential token has already been used or has expired."));
        }

        var issuedAt = ReadUnixTimeClaim(
            identity,
            JwtRegisteredClaimNames.Iat,
            now);

        var expiresAt = validationResult.SecurityToken?.ValidTo
            is DateTime validTo
            ? new DateTimeOffset(
                DateTime.SpecifyKind(
                    validTo,
                    DateTimeKind.Utc))
            : now;

        return Result<ValidatedMobileCredential>.Success(
            new ValidatedMobileCredential(
                TokenId: tokenId,
                StudentId: studentId,
                GroupId: studentResult.Value.GroupId,
                IssuedAt: issuedAt,
                ExpiresAt: expiresAt));
    }

    private static DateTimeOffset ReadUnixTimeClaim(
        ClaimsIdentity identity,
        string claimName,
        DateTimeOffset fallback)
    {
        var value = identity.FindFirst(claimName)?.Value;

        return long.TryParse(
            value,
            NumberStyles.Integer,
            CultureInfo.InvariantCulture,
            out var unixSeconds)
                ? DateTimeOffset.FromUnixTimeSeconds(
                    unixSeconds)
                : fallback;
    }

    private static Result<ValidatedMobileCredential>
        InvalidToken(string message)
    {
        return Result<ValidatedMobileCredential>.Failure(
            new Error(
                "mobile_credential.invalid",
                message));
    }

    private static void ValidateOptions(
        MobileCredentialOptions options)
    {
        if (string.IsNullOrWhiteSpace(options.Issuer))
            throw new InvalidOperationException(
                "MobileCredential:Issuer is required.");

        if (string.IsNullOrWhiteSpace(options.Audience))
            throw new InvalidOperationException(
                "MobileCredential:Audience is required.");

        if (string.IsNullOrWhiteSpace(options.SigningKey))
            throw new InvalidOperationException(
                "MobileCredential:SigningKey is required.");

        if (Encoding.UTF8.GetByteCount(
                options.SigningKey) < 32)
        {
            throw new InvalidOperationException(
                "MobileCredential:SigningKey must contain at least 32 bytes.");
        }

        if (options.LifetimeSeconds is < 15 or > 300)
        {
            throw new InvalidOperationException(
                "Mobile credential lifetime must be between 15 and 300 seconds.");
        }

        if (options.RefreshAfterSeconds < 1 ||
            options.RefreshAfterSeconds >=
            options.LifetimeSeconds)
        {
            throw new InvalidOperationException(
                "RefreshAfterSeconds must be less than LifetimeSeconds.");
        }
    }
}