using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace UniGate.Api.Auth;

public static class KeycloakRoleClaimsTransformer
{
    public static Task AddRealmRolesAsRoleClaims(TokenValidatedContext ctx)
    {
        var identity = ctx.Principal?.Identity as ClaimsIdentity;
        if (identity is null) return Task.CompletedTask;

        var existingRoles = new HashSet<string>(
            identity.FindAll(identity.RoleClaimType).Select(c => c.Value),
            StringComparer.OrdinalIgnoreCase);

        var realmAccessJson = ctx.Principal?.FindFirst("realm_access")?.Value;
        if (string.IsNullOrWhiteSpace(realmAccessJson))
            return Task.CompletedTask;

        try
        {
            using var doc = JsonDocument.Parse(realmAccessJson);
            if (!doc.RootElement.TryGetProperty("roles", out var rolesEl) || rolesEl.ValueKind != JsonValueKind.Array)
                return Task.CompletedTask;

            foreach (var roleEl in rolesEl.EnumerateArray())
            {
                var role = roleEl.GetString();
                if (string.IsNullOrWhiteSpace(role)) continue;

                if (existingRoles.Add(role))
                    identity.AddClaim(new Claim(identity.RoleClaimType, role));
            }
        }
        catch
        {
        }

        return Task.CompletedTask;
    }
}