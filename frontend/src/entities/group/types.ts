export type GroupDto = {
    id: string;
    code: string;
    name: string;
    admissionYear: number;
    isActive: boolean;
    createdAt: string;
};

export type GetGroupsParams = {
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
};

export type CreateGroupRequest = {
    code: string;
    name: string;
    admissionYear: number;
};

export type UpdateGroupRequest = {
    id: string;
    code: string;
    name: string;
    admissionYear: number;
};

export type SetGroupActiveRequest = {
    isActive: boolean;
};