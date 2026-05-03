export type AccessRuleWindowDto = {
    dayOfWeekIso: number;
    startTime: string;
    endTime: string;
};

export type AccessRuleDto = {
    id: string;
    zoneId: string;
    groupId: string;
    windows: AccessRuleWindowDto[];
    validFrom: string | null;
    validTo: string | null;
    isActive: boolean;
    createdAt: string;
};

export type GetAccessRulesParams = {
    zoneId?: string;
    groupId?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
};

export type CreateAccessRuleRequest = {
    zoneId: string;
    groupId: string;
    windows: AccessRuleWindowDto[];
    validFrom?: string | null;
    validTo?: string | null;
};

export type UpdateAccessRuleScheduleRequest = {
    windows: AccessRuleWindowDto[];
    validFrom?: string | null;
    validTo?: string | null;
};

export type SetAccessRuleActiveRequest = {
    isActive: boolean;
};