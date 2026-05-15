import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    createRoom,
    type CreateRoomRequest,
} from '../../../entities/room/api';

export function useCreateRoomMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateRoomRequest) =>
            createRoom(payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['rooms'],
            });
        },
    });
}