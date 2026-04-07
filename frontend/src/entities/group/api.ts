import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type { CreateGroupRequest, GetGroupsParams, GroupDto } from './types';

export async function getGroups(params: GetGroupsParams) {
    const response = await api.get<PagedResult<GroupDto>>('/api/groups', {
        params,
    });

    return response.data;
}

export async function createGroup(payload: CreateGroupRequest) {
    const response = await api.post<GroupDto>('/api/groups', payload);
    return response.data;
}