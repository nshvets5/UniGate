using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using UniGate.Access.Application.Admin;
using UniGate.Access.Application.Admin.Doors;
using UniGate.Access.Application.Admin.Rules;
using UniGate.Access.Application.Admin.Zones;
using UniGate.Access.Domain;
using UniGate.Access.Infrastructure.Persistence;
using UniGate.SharedKernel.Auth;
using UniGate.SharedKernel.Observability;
using UniGate.SharedKernel.Outbox;
using UniGate.SharedKernel.Pagination;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Infrastructure.Admin;

public sealed class EfAccessAdminStore : IAccessAdminStore
{
    private readonly AccessDbContext _db;
    private readonly ILogger<EfAccessAdminStore> _logger;

    private readonly ICurrentUser _currentUser;
    private readonly IIdentityProvider _identityProvider;
    private readonly IRequestContext _requestContext;

    public EfAccessAdminStore(
        AccessDbContext db,
        ILogger<EfAccessAdminStore> logger,
        ICurrentUser currentUser,
        IIdentityProvider identityProvider,
        IRequestContext requestContext)
    {
        _db = db;
        _logger = logger;
        _currentUser = currentUser;
        _identityProvider = identityProvider;
        _requestContext = requestContext;
    }

    // ZONES
    public async Task<Result<Guid>> CreateZoneAsync(CreateZoneCommand cmd, CancellationToken ct)
    {
        try
        {
            var code = cmd.Code.Trim();
            var exists = await _db.Zones.AsNoTracking().AnyAsync(x => x.Code == code, ct);
            if (exists)
                return Result<Guid>.Failure(new Error("zone.duplicate_code", "Zone code already exists."));

            var z = new Zone(code, cmd.Name.Trim());
            _db.Zones.Add(z);

            Emit(AccessOutboxTypes.ZoneCreated, new
            {
                zoneId = z.Id,
                z.Code,
                z.Name,
                z.IsActive,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result<Guid>.Success(z.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateZone failed");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PagedResult<ZoneDto>>> ListZonesAsync(string? search, int page, int pageSize, CancellationToken ct)
    {
        try
        {
            var q = _db.Zones.AsNoTracking().AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(x => x.Code.Contains(s) || x.Name.Contains(s));
            }

            q = q.OrderBy(x => x.Code);

            var total = await q.LongCountAsync(ct);
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
                .Select(x => new ZoneDto(x.Id, x.Code, x.Name, x.IsActive, x.CreatedAt))
                .ToListAsync(ct);

            return Result<PagedResult<ZoneDto>>.Success(new PagedResult<ZoneDto>(items, page, pageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ListZones failed");
            return Result<PagedResult<ZoneDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<ZoneDto>> GetZoneAsync(Guid id, CancellationToken ct)
    {
        try
        {
            var z = await _db.Zones.AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new ZoneDto(x.Id, x.Code, x.Name, x.IsActive, x.CreatedAt))
                .FirstOrDefaultAsync(ct);

            return z is null
                ? Result<ZoneDto>.Failure(new Error("zone.not_found", "Zone not found."))
                : Result<ZoneDto>.Success(z);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetZone failed");
            return Result<ZoneDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> UpdateZoneAsync(UpdateZoneCommand cmd, CancellationToken ct)
    {
        try
        {
            var z = await _db.Zones.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (z is null)
                return Result.Failure(new Error("zone.not_found", "Zone not found."));

            var newCode = cmd.Code.Trim();
            if (!string.Equals(z.Code, newCode, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _db.Zones.AsNoTracking().AnyAsync(x => x.Code == newCode && x.Id != cmd.Id, ct);
                if (exists)
                    return Result.Failure(new Error("zone.duplicate_code", "Zone code already exists."));

                z.ChangeCode(newCode);
            }

            z.Rename(cmd.Name.Trim());

            Emit(AccessOutboxTypes.ZoneUpdated, new
            {
                zoneId = z.Id,
                z.Code,
                z.Name,
                z.IsActive,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateZone failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> SetZoneActiveAsync(Guid id, bool isActive, CancellationToken ct)
    {
        try
        {
            var z = await _db.Zones.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (z is null)
                return Result.Failure(new Error("zone.not_found", "Zone not found."));

            z.SetActive(isActive);

            Emit(AccessOutboxTypes.ZoneActiveChanged, new
            {
                zoneId = z.Id,
                z.Code,
                z.Name,
                z.IsActive,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SetZoneActive failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    // DOORS
    public async Task<Result<Guid>> CreateDoorAsync(CreateDoorCommand cmd, CancellationToken ct)
    {
        try
        {
            var zoneExists = await _db.Zones.AsNoTracking().AnyAsync(z => z.Id == cmd.ZoneId, ct);
            if (!zoneExists)
                return Result<Guid>.Failure(new Error("door.zone_not_found", "Zone not found."));

            var code = cmd.Code.Trim();
            var exists = await _db.Doors.AsNoTracking().AnyAsync(x => x.Code == code, ct);
            if (exists)
                return Result<Guid>.Failure(new Error("door.duplicate_code", "Door code already exists."));

            var d = new Door(cmd.ZoneId, code, cmd.Name.Trim());
            _db.Doors.Add(d);

            Emit(AccessOutboxTypes.DoorCreated, new
            {
                doorId = d.Id,
                d.ZoneId,
                d.Code,
                d.Name,
                d.IsActive,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result<Guid>.Success(d.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateDoor failed");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PagedResult<DoorDto>>> ListDoorsAsync(Guid? zoneId, string? search, int page, int pageSize, CancellationToken ct)
    {
        try
        {
            var q = _db.Doors.AsNoTracking().AsQueryable();
            if (zoneId is not null)
                q = q.Where(x => x.ZoneId == zoneId.Value);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim();
                q = q.Where(x => x.Code.Contains(s) || x.Name.Contains(s));
            }

            q = q.OrderBy(x => x.Code);

            var total = await q.LongCountAsync(ct);
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
                .Select(x => new DoorDto(x.Id, x.ZoneId, x.Code, x.Name, x.IsActive, x.CreatedAt))
                .ToListAsync(ct);

            return Result<PagedResult<DoorDto>>.Success(new PagedResult<DoorDto>(items, page, pageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ListDoors failed");
            return Result<PagedResult<DoorDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<DoorDto>> GetDoorAsync(Guid id, CancellationToken ct)
    {
        try
        {
            var d = await _db.Doors.AsNoTracking()
                .Where(x => x.Id == id)
                .Select(x => new DoorDto(x.Id, x.ZoneId, x.Code, x.Name, x.IsActive, x.CreatedAt))
                .FirstOrDefaultAsync(ct);

            return d is null
                ? Result<DoorDto>.Failure(new Error("door.not_found", "Door not found."))
                : Result<DoorDto>.Success(d);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "GetDoor failed");
            return Result<DoorDto>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> UpdateDoorAsync(UpdateDoorCommand cmd, CancellationToken ct)
    {
        try
        {
            var d = await _db.Doors.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (d is null)
                return Result.Failure(new Error("door.not_found", "Door not found."));

            var zoneExists = await _db.Zones.AsNoTracking().AnyAsync(z => z.Id == cmd.ZoneId, ct);
            if (!zoneExists)
                return Result.Failure(new Error("door.zone_not_found", "Zone not found."));

            var newCode = cmd.Code.Trim();
            if (!string.Equals(d.Code, newCode, StringComparison.OrdinalIgnoreCase))
            {
                var exists = await _db.Doors.AsNoTracking().AnyAsync(x => x.Code == newCode && x.Id != cmd.Id, ct);
                if (exists)
                    return Result.Failure(new Error("door.duplicate_code", "Door code already exists."));

                d.ChangeCode(newCode);
            }

            if (d.ZoneId != cmd.ZoneId)
                d.MoveToZone(cmd.ZoneId);

            d.Rename(cmd.Name.Trim());

            Emit(AccessOutboxTypes.DoorUpdated, new
            {
                doorId = d.Id,
                d.ZoneId,
                d.Code,
                d.Name,
                d.IsActive,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateDoor failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> SetDoorActiveAsync(Guid id, bool isActive, CancellationToken ct)
    {
        try
        {
            var d = await _db.Doors.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (d is null)
                return Result.Failure(new Error("door.not_found", "Door not found."));

            d.SetActive(isActive);

            Emit(AccessOutboxTypes.DoorActiveChanged, new
            {
                doorId = d.Id,
                d.ZoneId,
                d.Code,
                d.Name,
                d.IsActive,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SetDoorActive failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    // RULES
    public async Task<Result<Guid>> CreateRuleAsync(CreateRuleCommand cmd, CancellationToken ct)
    {
        try
        {
            if (cmd.ZoneId == Guid.Empty || cmd.GroupId == Guid.Empty)
                return Result<Guid>.Failure(Errors.Validation.Failed("ZoneId and GroupId are required."));

            if (cmd.Windows is null || cmd.Windows.Count == 0)
                return Result<Guid>.Failure(Errors.Validation.Failed("At least one window is required."));

            foreach (var w in cmd.Windows)
            {
                if (w.DayOfWeekIso is < 1 or > 7)
                    return Result<Guid>.Failure(Errors.Validation.Failed("DayOfWeekIso must be 1..7."));

                if (w.StartTime == w.EndTime)
                    return Result<Guid>.Failure(Errors.Validation.Failed("StartTime and EndTime cannot be equal."));
            }

            if (cmd.ValidFrom is not null && cmd.ValidTo is not null && cmd.ValidTo < cmd.ValidFrom)
                return Result<Guid>.Failure(Errors.Validation.Failed("ValidTo must be >= ValidFrom."));

            var zoneExists = await _db.Zones.AsNoTracking().AnyAsync(z => z.Id == cmd.ZoneId, ct);
            if (!zoneExists)
                return Result<Guid>.Failure(new Error("rule.zone_not_found", "Zone not found."));

            var exists = await _db.Rules.AsNoTracking()
                .AnyAsync(r => r.ZoneId == cmd.ZoneId && r.GroupId == cmd.GroupId, ct);

            if (exists)
                return Result<Guid>.Failure(new Error("rule.duplicate", "Rule for this zone and group already exists."));

            var rule = new AccessRule(cmd.ZoneId, cmd.GroupId);

            try
            {
                rule.SetValidity(cmd.ValidFrom, cmd.ValidTo);
            }
            catch (InvalidOperationException ex)
            {
                return Result<Guid>.Failure(new Error("rule.validity_invalid", ex.Message));
            }

            _db.Rules.Add(rule);

            foreach (var w in cmd.Windows)
            {
                _db.RuleWindows.Add(new RuleWindow(rule.Id, w.DayOfWeekIso, w.StartTime, w.EndTime));
            }

            Emit(AccessOutboxTypes.RuleCreated, new
            {
                ruleId = rule.Id,
                rule.ZoneId,
                rule.GroupId,
                rule.IsActive,
                rule.ValidFrom,
                rule.ValidTo,
                windows = cmd.Windows,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result<Guid>.Success(rule.Id);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "CreateRule DbUpdateException");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "CreateRule failed");
            return Result<Guid>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result<PagedResult<RuleDto>>> ListRulesAsync(Guid? zoneId, Guid? groupId, bool? isActive, int page, int pageSize, CancellationToken ct)
    {
        try
        {
            var q = _db.Rules.AsNoTracking().AsQueryable();
            if (zoneId is not null) q = q.Where(x => x.ZoneId == zoneId.Value);
            if (groupId is not null) q = q.Where(x => x.GroupId == groupId.Value);
            if (isActive is not null) q = q.Where(x => x.IsActive == isActive.Value);

            q = q.OrderByDescending(x => x.CreatedAt);

            var total = await q.LongCountAsync(ct);
            var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
                .Select(x => new RuleDto(x.Id, x.ZoneId, x.GroupId, x.IsActive, x.CreatedAt))
                .ToListAsync(ct);

            return Result<PagedResult<RuleDto>>.Success(new PagedResult<RuleDto>(items, page, pageSize, total));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "ListRules failed");
            return Result<PagedResult<RuleDto>>.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> UpdateRuleScheduleAsync(UpdateRuleScheduleCommand cmd, CancellationToken ct)
    {
        try
        {
            if (cmd.Id == Guid.Empty)
                return Result.Failure(Errors.Validation.Failed("Id is required."));

            if (cmd.Windows is null || cmd.Windows.Count == 0)
                return Result.Failure(Errors.Validation.Failed("At least one window is required."));

            foreach (var w in cmd.Windows)
            {
                if (w.DayOfWeekIso is < 1 or > 7)
                    return Result.Failure(Errors.Validation.Failed("DayOfWeekIso must be 1..7."));

                if (w.StartTime == w.EndTime)
                    return Result.Failure(Errors.Validation.Failed("StartTime and EndTime cannot be equal."));
            }

            if (cmd.ValidFrom is not null && cmd.ValidTo is not null && cmd.ValidTo < cmd.ValidFrom)
                return Result.Failure(Errors.Validation.Failed("ValidTo must be >= ValidFrom."));

            var r = await _db.Rules.FirstOrDefaultAsync(x => x.Id == cmd.Id, ct);
            if (r is null)
                return Result.Failure(new Error("rule.not_found", "Rule not found."));

            try
            {
                r.SetValidity(cmd.ValidFrom, cmd.ValidTo);
                r.SetActive(true);
            }
            catch (InvalidOperationException ex)
            {
                return Result.Failure(new Error("rule.validity_invalid", ex.Message));
            }

            var existing = await _db.RuleWindows
                .Where(w => w.RuleId == r.Id)
                .ToListAsync(ct);

            _db.RuleWindows.RemoveRange(existing);

            foreach (var w in cmd.Windows)
            {
                _db.RuleWindows.Add(new RuleWindow(r.Id, w.DayOfWeekIso, w.StartTime, w.EndTime));
            }

            Emit(AccessOutboxTypes.RuleUpdatedSchedule, new
            {
                ruleId = r.Id,
                r.ZoneId,
                r.GroupId,
                r.IsActive,
                r.ValidFrom,
                r.ValidTo,
                windows = cmd.Windows,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "UpdateRuleSchedule DbUpdateException");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "UpdateRuleSchedule failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    public async Task<Result> SetRuleActiveAsync(Guid id, bool isActive, CancellationToken ct)
    {
        try
        {
            var r = await _db.Rules.FirstOrDefaultAsync(x => x.Id == id, ct);
            if (r is null)
                return Result.Failure(new Error("rule.not_found", "Rule not found."));

            r.SetActive(isActive);

            Emit(AccessOutboxTypes.RuleActiveChanged, new
            {
                ruleId = r.Id,
                r.ZoneId,
                r.GroupId,
                r.IsActive,
                Actor = Actor()
            });

            await _db.SaveChangesAsync(ct);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SetRuleActive failed");
            return Result.Failure(Errors.Infrastructure.DatabaseFailure);
        }
    }

    private void Emit(string type, object payload)
    {
        var json = JsonSerializer.Serialize(payload);

        _db.OutboxMessages.Add(new OutboxMessage(
            type: type,
            payloadJson: json,
            correlationId: _requestContext.CorrelationId,
            traceId: _requestContext.TraceId));
    }

    private object Actor() => new
    {
        actorProvider = _identityProvider.Name,
        actorSubject = _currentUser.Subject,
        occurredAt = DateTimeOffset.UtcNow
    };
}