import { api } from '../../shared/api/axios';
import type { CurrentUserDto } from './types';

export async function getCurrentUser(accessToken?: string) {
    const response = await api.get<CurrentUserDto>('/me', {
        headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : undefined,
    });

    return response.data;
}