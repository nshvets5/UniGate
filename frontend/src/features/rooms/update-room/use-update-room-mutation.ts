import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    updateRoom,
    type UpdateRoomRequest,
} from '../../../entities/room/api';

export function useUpdateRoomMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateRoomRequest) =>
            updateRoom(payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['rooms'],
            });
        },
    });
}