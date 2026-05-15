import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
import { useMemo, useState } from 'react';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { CreateDoorDialog } from '../../features/doors/create-door/create-door-dialog';
import { useDoorsQuery } from '../../features/doors/list-doors/use-doors-query';
import { useToggleDoorActiveMutation } from '../../features/doors/toggle-door-active/use-toggle-door-active-mutation';
import { UpdateDoorDialog } from '../../features/doors/update-door/update-door-dialog';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zone: ZoneDto;
    rooms: RoomDto[];
};

export function ZoneDoorsSection({ zone, rooms }: Props) {
    const theme = useTheme();
    const [createOpen, setCreateOpen] = useState(false);
    const [editingDoor, setEditingDoor] = useState<DoorDto | null>(null);

    const doorsQuery = useDoorsQuery({
        zoneId: zone.id,
        page: 1,
        pageSize: 100,
    });

    const toggleMutation = useToggleDoorActiveMutation();

    const roomMap = useMemo(() => {
        const map = new Map<string, RoomDto>();

        for (const room of rooms) {
            map.set(room.id, room);
        }

        return map;
    }, [rooms]);

    const handleToggleActive = async (door: DoorDto) => {
        await toggleMutation.mutateAsync({
            id: door.id,
            isActive: !door.isActive,
        });
    };

    const doors = doorsQuery.data?.items ?? [];

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
                        <Typography variant="subtitle1">Doors in {zone.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Doors may be linked to a specific room or control access to the entire zone.
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={() => setCreateOpen(true)}
                    >
                        Add door
                    </Button>
                </Box>

                <Divider />

                {doorsQuery.isLoading ? (
                    <LoadingState
                        title="Loading doors"
                        description="Please wait while zone doors are being loaded."
                    />
                ) : doorsQuery.isError ? (
                    <ErrorState
                        title="Failed to load doors"
                        description="The doors list could not be loaded from the server."
                        onRetry={() => void doorsQuery.refetch()}
                    />
                ) : doors.length === 0 ? (
                    <EmptyState
                        title="No doors found"
                        description="Add the first door to connect readers and physical access points with this zone."
                        action={
                            <Button
                                variant="contained"
                                startIcon={<AddOutlinedIcon />}
                                onClick={() => setCreateOpen(true)}
                            >
                                Add first door
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
                        {doors.map((door) => {
                            const room = door.roomId ? roomMap.get(door.roomId) : null;
                            const isTogglingCurrent =
                                toggleMutation.isPending &&
                                toggleMutation.variables?.id === door.id;

                            return (
                                <Box
                                    key={door.id}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: door.isActive
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
                                                <DoorSlidingOutlinedIcon fontSize="small" />
                                            </Box>

                                            <Stack minWidth={0} flex={1} spacing={0.6}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {door.name}
                                                </Typography>

                                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                    <CodeBadge value={door.code} />
                                                    <StatusChip
                                                        label={door.isActive ? 'Active' : 'Inactive'}
                                                        variant={door.isActive ? 'success' : 'warning'}
                                                    />
                                                </Stack>
                                            </Stack>
                                        </Stack>

                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2.5,
                                                bgcolor: alpha(theme.palette.primary.main, 0.035),
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Typography variant="caption" color="text.secondary">
                                                Target scope
                                            </Typography>
                                            <Typography variant="body2">
                                                {room
                                                    ? `Room: ${room.name} (${room.code})`
                                                    : 'Zone-level entrance'}
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Edit door">
                                                <IconButton onClick={() => setEditingDoor(door)}>
                                                    <EditOutlinedIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip
                                                title={door.isActive ? 'Deactivate door' : 'Activate door'}
                                            >
                                                <span>
                                                    <IconButton
                                                        onClick={() => void handleToggleActive(door)}
                                                        disabled={isTogglingCurrent}
                                                    >
                                                        {isTogglingCurrent ? (
                                                            <CircularProgress size={18} />
                                                        ) : door.isActive ? (
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

            <CreateDoorDialog
                open={createOpen}
                zoneId={zone.id}
                rooms={rooms}
                onClose={() => setCreateOpen(false)}
            />

            <UpdateDoorDialog
                open={Boolean(editingDoor)}
                door={editingDoor}
                rooms={rooms}
                onClose={() => setEditingDoor(null)}
            />
        </>
    );
}