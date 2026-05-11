import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resendMyVerificationEmail } from '../../../entities/me/security-api';

export function useResendVerificationEmailMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: resendMyVerificationEmail,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['me', 'security'],
            });
        },
    });
}