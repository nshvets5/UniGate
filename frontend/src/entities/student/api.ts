import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type {
    ChangeStudentGroupRequest,
    CreateStudentCredentialRequest,
    CreateStudentRequest,
    GetStudentsParams,
    SetStudentActiveRequest,
    SetStudentCredentialActiveRequest,
    StudentCredentialDto,
    StudentDto,
    UpdateStudentRequest,
} from './types';

export async function getStudents(params: GetStudentsParams) {
    const response = await api.get<PagedResult<StudentDto>>('/students', {
        params,
    });

    return response.data;
}

export async function getStudent(id: string) {
    const response = await api.get<StudentDto>(`/students/${id}`);
    return response.data;
}

export async function createStudent(payload: CreateStudentRequest) {
    const response = await api.post<StudentDto>('/students', payload);
    return response.data;
}

export async function updateStudent(payload: UpdateStudentRequest) {
    const response = await api.put<StudentDto>(`/students/${payload.id}`, payload);
    return response.data;
}

export async function setStudentActive(
    id: string,
    payload: SetStudentActiveRequest
) {
    const response = await api.patch<StudentDto>(`/students/${id}/active`, payload);
    return response.data;
}

export async function changeStudentGroup(
    id: string,
    payload: ChangeStudentGroupRequest
) {
    const response = await api.patch<StudentDto>(`/students/${id}/group`, payload);
    return response.data;
}

export async function getStudentCredentials(studentId: string) {
    const response = await api.get<StudentCredentialDto[]>(
        `/students/${studentId}/credentials`
    );
    return response.data;
}

export async function createStudentCredential(
    studentId: string,
    payload: CreateStudentCredentialRequest
) {
    const response = await api.post<StudentCredentialDto>(
        `/students/${studentId}/credentials`,
        payload
    );
    return response.data;
}

export async function setStudentCredentialActive(
    studentId: string,
    credentialId: string,
    payload: SetStudentCredentialActiveRequest
) {
    const response = await api.patch<StudentCredentialDto>(
        `/students/${studentId}/credentials/${credentialId}/active`,
        payload
    );
    return response.data;
}