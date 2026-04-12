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

export type UpdateStudentRequest = {
    id: string;
    firstName: string;
    lastName: string;
    middleName?: string | null;
    email: string;
};

export type SetStudentActiveRequest = {
    isActive: boolean;
};

export type ChangeStudentGroupRequest = {
    groupId: string;
};

export type StudentCredentialDto = {
    id: string;
    studentId: string;
    type: 'rfid' | 'qr' | 'manual';
    value: string;
    isActive: boolean;
    createdAt: string;
};

export type CreateStudentCredentialRequest = {
    studentId: string;
    type: 'rfid' | 'qr' | 'manual';
    value: string;
};

export type SetStudentCredentialActiveRequest = {
    isActive: boolean;
};