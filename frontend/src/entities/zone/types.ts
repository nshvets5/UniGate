export type ZoneDto = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
};

export type GetZonesParams = {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
};

export type CreateZoneRequest = {
    code: string;
    name: string;
    description?: string | null;
};

export type UpdateZoneRequest = {
    id: string;
    code: string;
    name: string;
    description?: string | null;
};

export type SetZoneActiveRequest = {
    isActive: boolean;
};