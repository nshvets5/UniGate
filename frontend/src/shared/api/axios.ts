import axios from 'axios';
import { env } from '../../app/config/env';
import { keycloak } from '../auth/keycloak';
import { publishApiError } from './api-error-events';
import { getApiErrorMessage } from './problem-details';

export const api = axios.create({
    baseURL: env.apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(async (config) => {
    if (keycloak.authenticated) {
        try {
            await keycloak.updateToken(30);
        } catch {
            // ignore here; guarded routes and logout flow handle invalid session
        }

        if (keycloak.token) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status as number | undefined;

        if (status && status !== 401) {
            publishApiError({
                status,
                message: getApiErrorMessage(
                    error.response?.data,
                    status === 403
                        ? 'You do not have permission to perform this action.'
                        : 'Request failed'
                ),
            });
        }

        return Promise.reject(error);
    }
);