import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';

export type RoomDto = {
    id: string;
    code: string;
    name: string;
    zoneId: string;
    isActive: boolean;
    createdAt: string;
};

export type GetRoomsParams = {
    search?: string;
    page?: number;
    pageSize?: number;
};

export type CreateRoomRequest = {
    code: string;
    name: string;
    zoneId: string;
};

export type UpdateRoomRequest = {
    id: string;
    code: string;
    name: string;
    zoneId: string;
};

export async function getRooms(params: GetRoomsParams) {
    const response = await api.get<PagedResult<RoomDto>>('/rooms', {
        params,
    });

    return response.data;
}

export async function createRoom(payload: CreateRoomRequest) {
    const response = await api.post<RoomDto>('/rooms', payload);
    return response.data;
}

export async function updateRoom(payload: UpdateRoomRequest) {
    const response = await api.put<RoomDto>(
        `/rooms/${payload.id}`,
        payload
    );

    return response.data;
}

export async function toggleRoomActive(
    id: string,
    isActive: boolean
) {
    const response = await api.patch<RoomDto>(
        `/rooms/${id}/active`,
        { isActive }
    );

    return response.data;
}