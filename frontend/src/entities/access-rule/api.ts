import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type {
    AccessRuleDto,
    AccessRuleWindowDto,
    AccessTargetType,
} from './types';

export type GetAccessRulesParams = {
    targetType?: AccessTargetType;
    targetId?: string;
    groupId?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
};

export type CreateAccessRuleRequest = {
    groupId: string;
    targetType: AccessTargetType;
    targetId: string;
    windows: AccessRuleWindowDto[];
    validFrom: string | null;
    validTo: string | null;
};

export type UpdateAccessRuleScheduleRequest = {
    targetType: AccessTargetType;
    targetId: string;
    windows: AccessRuleWindowDto[];
    validFrom: string | null;
    validTo: string | null;
};

export async function getAccessRules(params: GetAccessRulesParams) {
    const response = await api.get<PagedResult<AccessRuleDto>>('/access/rules', {
        params,
    });

    return response.data;
}

export async function createAccessRule(payload: CreateAccessRuleRequest) {
    const response = await api.post<AccessRuleDto>('/access/rules', payload);
    return response.data;
}

export async function updateAccessRuleSchedule(
    id: string,
    payload: UpdateAccessRuleScheduleRequest
) {
    const response = await api.patch<AccessRuleDto>(
        `/access/rules/${id}/schedule`,
        payload
    );

    return response.data;
}

export async function toggleAccessRuleActive(id: string, isActive: boolean) {
    const response = await api.patch<AccessRuleDto>(
        `/access/rules/${id}/active`,
        { isActive }
    );

    return response.data;
}

export async function setAccessRuleActive(id: string, isActive: boolean) {
    return toggleAccessRuleActive(id, isActive);
}