import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type {
    CreateZoneRequest,
    GetZonesParams,
    SetZoneActiveRequest,
    UpdateZoneRequest,
    ZoneDto,
} from './types';

export async function getZones(params: GetZonesParams) {
    const response = await api.get<PagedResult<ZoneDto>>('/zones', {
        params,
    });

    return response.data;
}

export async function createZone(payload: CreateZoneRequest) {
    const response = await api.post<ZoneDto>('/zones', payload);
    return response.data;
}

export async function updateZone(payload: UpdateZoneRequest) {
    const response = await api.put<ZoneDto>(`/zones/${payload.id}`, payload);
    return response.data;
}

export async function setZoneActive(id: string, payload: SetZoneActiveRequest) {
    const response = await api.patch<ZoneDto>(`/zones/${id}/active`, payload);
    return response.data;
}