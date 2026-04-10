import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type {
    CreateGroupRequest,
    GetGroupsParams,
    GroupDto,
    SetGroupActiveRequest,
    UpdateGroupRequest,
} from './types';

export async function getGroups(params: GetGroupsParams) {
    const response = await api.get<PagedResult<GroupDto>>('/groups', {
        params,
    });

    return response.data;
}

export async function createGroup(payload: CreateGroupRequest) {
    const response = await api.post<GroupDto>('/groups', payload);
    return response.data;
}

export async function updateGroup(payload: UpdateGroupRequest) {
    const response = await api.put<GroupDto>(`/groups/${payload.id}`, payload);
    return response.data;
}

export async function setGroupActive(id: string, payload: SetGroupActiveRequest) {
    const response = await api.patch<GroupDto>(`/groups/${id}/active`, payload);
    return response.data;
}