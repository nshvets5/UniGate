import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type {
    CreateDoorRequest,
    DoorDto,
    GetDoorsParams,
    SetDoorActiveRequest,
    UpdateDoorRequest,
} from './types';

export async function getDoors(params: GetDoorsParams) {
    const response = await api.get<PagedResult<DoorDto>>('/doors', {
        params,
    });

    return response.data;
}

export async function createDoor(payload: CreateDoorRequest) {
    const response = await api.post<DoorDto>('/doors', payload);
    return response.data;
}

export async function updateDoor(payload: UpdateDoorRequest) {
    const response = await api.put<DoorDto>(`/doors/${payload.id}`, payload);
    return response.data;
}

export async function setDoorActive(id: string, payload: SetDoorActiveRequest) {
    const response = await api.patch<DoorDto>(`/doors/${id}/active`, payload);
    return response.data;
}