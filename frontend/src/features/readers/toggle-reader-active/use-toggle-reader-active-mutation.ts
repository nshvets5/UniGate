import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setReaderActive } from '../../../entities/reader/api';

export function useToggleReaderActiveMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            setReaderActive(id, isActive),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['readers'],
            });
        },
    });
}