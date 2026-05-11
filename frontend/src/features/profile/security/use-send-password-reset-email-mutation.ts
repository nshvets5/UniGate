import { useMutation } from '@tanstack/react-query';
import { sendMyPasswordResetEmail } from '../../../entities/me/security-api';

export function useSendPasswordResetEmailMutation() {
    return useMutation({
        mutationFn: sendMyPasswordResetEmail,
    });
}