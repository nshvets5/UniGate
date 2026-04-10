export type StudentDto = {
    id: string;
    groupId: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    email: string;
    iamProfileId: string | null;
    isActive: boolean;
    createdAt: string;
};

export type GetStudentsParams = {
    groupId?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
};

export type CreateStudentRequest = {
    groupId: string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    email: string;
};