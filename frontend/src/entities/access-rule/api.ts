import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type {
    AccessRuleDto,
    CreateAccessRuleRequest,
    GetAccessRulesParams,
    SetAccessRuleActiveRequest,
    UpdateAccessRuleScheduleRequest,
} from './types';

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

export async function setAccessRuleActive(
    id: string,
    payload: SetAccessRuleActiveRequest
) {
    const response = await api.patch<AccessRuleDto>(
        `/access/rules/${id}/active`,
        payload
    );

    return response.data;
}