import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleRoomActive } from '../../../entities/room/api';

export function useToggleRoomActiveMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         isActive,
                     }: {
            id: string;
            isActive: boolean;
        }) => toggleRoomActive(id, isActive),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['rooms'],
            });
        },
    });
}