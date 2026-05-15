import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { CreateRoomDialog } from '../../features/rooms/create-room/create-room-dialog';
import { useToggleRoomActiveMutation } from '../../features/rooms/toggle-room-active/use-toggle-room-active-mutation';
import { UpdateRoomDialog } from '../../features/rooms/update-room/update-room-dialog';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zone: ZoneDto;
    rooms: RoomDto[];
    isLoading: boolean;
};

export function ZoneRoomsSection({ zone, rooms, isLoading }: Props) {
    const theme = useTheme();
    const [createOpen, setCreateOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomDto | null>(null);

    const toggleMutation = useToggleRoomActiveMutation();

    const handleToggleActive = async (room: RoomDto) => {
        await toggleMutation.mutateAsync({
            id: room.id,
            isActive: !room.isActive,
        });
    };

    return (
        <>
            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box
                    sx={{
                        p: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: 'wrap',
                    }}
                >
                    <Stack spacing={0.5}>
                        <Typography variant="subtitle1">Rooms in {zone.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage rooms assigned to this access zone.
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={() => setCreateOpen(true)}
                    >
                        Add room
                    </Button>
                </Box>

                <Divider />

                {isLoading ? (
                    <LoadingState
                        title="Loading rooms"
                        description="Please wait while zone rooms are being loaded."
                    />
                ) : rooms.length === 0 ? (
                    <EmptyState
                        title="No rooms in this zone"
                        description="Create the first room to enable room-level access rules."
                        action={
                            <Button
                                variant="contained"
                                startIcon={<AddOutlinedIcon />}
                                onClick={() => setCreateOpen(true)}
                            >
                                Add first room
                            </Button>
                        }
                    />
                ) : (
                    <Box
                        sx={{
                            p: 2.25,
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                lg: 'repeat(2, minmax(0, 1fr))',
                            },
                            gap: 1.5,
                        }}
                    >
                        {rooms.map((room) => {
                            const isTogglingCurrent =
                                toggleMutation.isPending &&
                                toggleMutation.variables?.id === room.id;

                            return (
                                <Box
                                    key={room.id}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: room.isActive
                                            ? alpha(theme.palette.success.main, 0.22)
                                            : alpha(theme.palette.warning.main, 0.22),
                                        bgcolor: 'background.paper',
                                    }}
                                >
                                    <Stack spacing={1.5}>
                                        <Stack direction="row" spacing={1.25} alignItems="flex-start">
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2.5,
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: 'primary.main',
                                                }}
                                            >
                                                <MeetingRoomOutlinedIcon fontSize="small" />
                                            </Box>

                                            <Stack minWidth={0} flex={1} spacing={0.6}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {room.name}
                                                </Typography>

                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    <CodeBadge value={room.code} />
                                                    <StatusChip
                                                        label={room.isActive ? 'Active' : 'Inactive'}
                                                        variant={room.isActive ? 'success' : 'warning'}
                                                    />
                                                </Stack>
                                            </Stack>
                                        </Stack>

                                        <Typography variant="caption" color="text.secondary">
                                            Created: {new Date(room.createdAt).toLocaleString()}
                                        </Typography>

                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Edit room">
                                                <IconButton onClick={() => setEditingRoom(room)}>
                                                    <EditOutlinedIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title={room.isActive ? 'Deactivate room' : 'Activate room'}>
                                                <span>
                                                    <IconButton
                                                        onClick={() => void handleToggleActive(room)}
                                                        disabled={isTogglingCurrent}
                                                    >
                                                        {isTogglingCurrent ? (
                                                            <CircularProgress size={18} />
                                                        ) : room.isActive ? (
                                                            <PauseCircleOutlineOutlinedIcon />
                                                        ) : (
                                                            <PlayCircleOutlineOutlinedIcon />
                                                        )}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Box>
                )}
            </SectionCard>

            <CreateRoomDialog
                open={createOpen}
                zoneId={zone.id}
                onClose={() => setCreateOpen(false)}
            />

            <UpdateRoomDialog
                open={Boolean(editingRoom)}
                room={editingRoom}
                onClose={() => setEditingRoom(null)}
            />
        </>
    );
}