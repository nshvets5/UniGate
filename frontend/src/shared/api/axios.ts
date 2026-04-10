import axios from 'axios';
import { env } from '../../app/config/env';
import { keycloak } from '../auth/keycloak';

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