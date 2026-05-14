import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';

export type RoomDto = {
    id: string;
    code: string;
    name: string;
    floor: number | null;
    building: string | null;
    isActive: boolean;
    createdAt: string;
};

export type GetRoomsParams = {
    search?: string;
    page?: number;
    pageSize?: number;
};

export async function getRooms(params: GetRoomsParams) {
    const response = await api.get<PagedResult<RoomDto>>('/rooms', { params });
    return response.data;
}