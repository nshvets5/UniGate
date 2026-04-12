export type DoorDto = {
    id: string;
    zoneId: string;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
};

export type GetDoorsParams = {
    zoneId?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
};

export type CreateDoorRequest = {
    zoneId: string;
    code: string;
    name: string;
    description?: string | null;
};

export type UpdateDoorRequest = {
    id: string;
    zoneId: string;
    code: string;
    name: string;
    description?: string | null;
};

export type SetDoorActiveRequest = {
    isActive: boolean;
};