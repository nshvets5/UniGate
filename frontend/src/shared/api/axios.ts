import axios from 'axios';
import { env } from '../../app/config/env';
import { getAccessToken } from '../auth/token-storage';

export const api = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = getAccessToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});