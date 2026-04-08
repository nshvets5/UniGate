import { api } from '../../shared/api/axios';
import type { CurrentUserDto } from './types';

export async function getCurrentUser() {
    const response = await api.get<CurrentUserDto>('/me');
    return response.data;
}