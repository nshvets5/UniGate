import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';
import type {
    CreateStudentRequest,
    GetStudentsParams,
    StudentDto,
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