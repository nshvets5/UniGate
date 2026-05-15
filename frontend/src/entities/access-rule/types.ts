export enum AccessTargetType {
    Zone = 1,
    Room = 2,
    Door = 3,
}

export type AccessRuleWindowDto = {
    dayOfWeekIso: number;
    startTime: string;
    endTime: string;
};

export type AccessRuleDto = {
    id: string;
    groupId: string;
    targetType: AccessTargetType;
    targetId: string;
    windows: AccessRuleWindowDto[];
    validFrom: string | null;
    validTo: string | null;
    isActive: boolean;
    createdAt: string;
};