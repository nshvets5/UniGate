export type DoorDto = {
    id: string;
    zoneId: string;
    roomId: string | null;
    code: string;
    name: string;
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
    roomId: string | null;
    code: string;
    name: string;
};

export type UpdateDoorRequest = {
    id: string;
    zoneId: string;
    roomId: string | null;
    code: string;
    name: string;
};

export type SetDoorActiveRequest = {
    isActive: boolean;
};