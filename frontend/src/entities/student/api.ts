import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type {
    ChangeStudentGroupRequest,
    CreateStudentRequest,
    GetStudentsParams,
    SetStudentActiveRequest,
    StudentDto,
    UpdateStudentRequest,
} from './types';

export async function getStudents(params: GetStudentsParams) {
    const response = await api.get<PagedResult<StudentDto>>('/students', {
        params,
    });

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