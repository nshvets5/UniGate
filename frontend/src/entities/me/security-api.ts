import { api } from '../../shared/api/axios';

export type MeSecurityDto = {
    isAuthenticated: boolean;
    subject: string;
    provider: string;
    email: string;
    emailVerified: boolean;
    availableActions: {
        canResendVerificationEmail: boolean;
        canSendPasswordResetEmail: boolean;
    };
};

export async function getMeSecurity() {
    const response = await api.get<MeSecurityDto>('/me/security');
    return response.data;
}

export async function resendMyVerificationEmail() {
    const response = await api.post<void>('/me/email/resend-verification');
    return response.data;
}

export async function sendMyPasswordResetEmail() {
    const response = await api.post<void>('/me/password/send-reset');
    return response.data;
}