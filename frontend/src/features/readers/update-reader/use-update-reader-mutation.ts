import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReader } from '../../../entities/reader/api';

export function useUpdateReaderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateReader,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['readers'],
            });
        },
    });
}