import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    scanCredential,
    type ScanRequest,
} from '../../../entities/device-emulator/api';

export function useScanCredentialMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: ScanRequest) => scanCredential(payload),

        onSuccess: async (_, variables) => {
            await queryClient.invalidateQueries({
                queryKey: ['attempts'],
            });

            await queryClient.invalidateQueries({
                queryKey: ['reader-attempts', variables.readerId],
            });
        },
    });
}