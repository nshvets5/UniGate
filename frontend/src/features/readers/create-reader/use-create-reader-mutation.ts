import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReader } from '../../../entities/reader/api';

export function useCreateReaderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReader,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['readers'],
            });
        },
    });
}