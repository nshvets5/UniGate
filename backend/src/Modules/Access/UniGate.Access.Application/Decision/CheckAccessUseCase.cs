using UniGate.SharedKernel.Directory;
using UniGate.SharedKernel.Results;

namespace UniGate.Access.Application.Decision;

public sealed class CheckAccessUseCase
{
    private readonly IStudentLookup _students;
    private readonly IAccessDecisionStore _store;

    public CheckAccessUseCase(IStudentLookup students, IAccessDecisionStore store)
    {
        _students = students;
        _store = store;
    }

    public async Task<Result<AccessDecisionDto>> ExecuteAsync(CheckAccessCommand cmd, CancellationToken ct = default)
    {
        if (cmd.DoorId == Guid.Empty || cmd.IamProfileId == Guid.Empty)
            return Result<AccessDecisionDto>.Failure(Errors.Validation.Failed("DoorId and IamProfileId are required."));

        var studentRes = await _students.FindByProfileIdAsync(cmd.IamProfileId, ct);
        if (!studentRes.IsSuccess)
            return Result<AccessDecisionDto>.Failure(studentRes.Error);

        var st = studentRes.Value;

        var doorRes = await _store.GetDoorZoneAsync(cmd.DoorId, ct);
        if (!doorRes.IsSuccess)
            return Result<AccessDecisionDto>.Failure(doorRes.Error);

        var (zoneId, doorActive, zoneActive) = doorRes.Value;

        if (!doorActive)
            return Result<AccessDecisionDto>.Success(new(false, "DOOR_INACTIVE", cmd.DoorId, zoneId, st.StudentId, st.GroupId));

        if (!zoneActive)
            return Result<AccessDecisionDto>.Success(new(false, "ZONE_INACTIVE", cmd.DoorId, zoneId, st.StudentId, st.GroupId));

        var ruleRes = await _store.HasActiveRuleAsync(zoneId, st.GroupId, ct);
        if (!ruleRes.IsSuccess)
            return Result<AccessDecisionDto>.Failure(ruleRes.Error);

        return ruleRes.Value
            ? Result<AccessDecisionDto>.Success(new(true, "RULE_MATCH", cmd.DoorId, zoneId, st.StudentId, st.GroupId))
            : Result<AccessDecisionDto>.Success(new(false, "NO_RULE", cmd.DoorId, zoneId, st.StudentId, st.GroupId));
    }
}