namespace UniGate.SharedKernel.Outbox;

public static class AccessOutboxTypes
{
    public const string ZoneCreated = "access.zone_created";
    public const string ZoneUpdated = "access.zone_updated";
    public const string ZoneActiveChanged = "access.zone_active_changed";

    public const string DoorCreated = "access.door_created";
    public const string DoorUpdated = "access.door_updated";
    public const string DoorActiveChanged = "access.door_active_changed";

    public const string RuleCreated = "access.rule_created";
    public const string RuleActiveChanged = "access.rule_active_changed";
}