import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { CreateDoorDialog } from '../../features/doors/create-door/create-door-dialog';
import { useToggleDoorActiveMutation } from '../../features/doors/toggle-door-active/use-toggle-door-active-mutation';
import { UpdateDoorDialog } from '../../features/doors/update-door/update-door-dialog';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zone: ZoneDto;
    rooms: RoomDto[];
    doors: DoorDto[];
    isLoading: boolean;
};

type ScopeFilter = 'all' | 'zone' | 'room';
type StatusFilter = 'all' | 'active' | 'inactive';

export function ZoneDoorsSection({ zone, rooms, doors, isLoading }: Props) {
    const theme = useTheme();
    const [createOpen, setCreateOpen] = useState(false);
    const [editingDoor, setEditingDoor] = useState<DoorDto | null>(null);
    const [search, setSearch] = useState('');
    const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    const toggleMutation = useToggleDoorActiveMutation();

    const roomMap = useMemo(() => {
        const map = new Map<string, RoomDto>();

        for (const room of rooms) {
            map.set(room.id, room);
        }

        return map;
    }, [rooms]);

    const filteredDoors = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        return doors.filter((door) => {
            const room = door.roomId ? roomMap.get(door.roomId) : null;

            const matchesSearch =
                !normalizedSearch ||
                [door.name, door.code, room?.name, room?.code]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedSearch);

            const matchesScope =
                scopeFilter === 'all' ||
                (scopeFilter === 'zone' && !door.roomId) ||
                (scopeFilter === 'room' && Boolean(door.roomId));

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && door.isActive) ||
                (statusFilter === 'inactive' && !door.isActive);

            return matchesSearch && matchesScope && matchesStatus;
        });
    }, [doors, roomMap, search, scopeFilter, statusFilter]);

    const handleToggleActive = async (door: DoorDto) => {
        await toggleMutation.mutateAsync({
            id: door.id,
            isActive: !door.isActive,
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

                <Box sx={{ p: 2.25 }}>
                    <Stack spacing={1.5}>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={1.5}
                            justifyContent="space-between"
                            alignItems={{ xs: 'stretch', md: 'center' }}
                        >
                            <TextField
                                size="small"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search doors or rooms..."
                                sx={{ minWidth: { md: 300 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {[
                                    ['all', 'All scopes'],
                                    ['zone', 'Zone-level'],
                                    ['room', 'Room-level'],
                                ].map(([value, label]) => (
                                    <Chip
                                        key={value}
                                        label={label}
                                        clickable
                                        color={scopeFilter === value ? 'primary' : 'default'}
                                        variant={scopeFilter === value ? 'filled' : 'outlined'}
                                        onClick={() => setScopeFilter(value as ScopeFilter)}
                                    />
                                ))}
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {[
                                ['all', 'All'],
                                ['active', 'Active'],
                                ['inactive', 'Inactive'],
                            ].map(([value, label]) => (
                                <Chip
                                    key={value}
                                    label={label}
                                    clickable
                                    color={statusFilter === value ? 'primary' : 'default'}
                                    variant={statusFilter === value ? 'filled' : 'outlined'}
                                    onClick={() => setStatusFilter(value as StatusFilter)}
                                />
                            ))}
                        </Stack>
                    </Stack>
                </Box>

                <Divider />

                {isLoading ? (
                    <LoadingState
                        title="Loading doors"
                        description="Please wait while zone doors are being loaded."
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
                ) : filteredDoors.length === 0 ? (
                    <EmptyState
                        title="No doors match filters"
                        description="Try changing search, scope or status filters."
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
                        {filteredDoors.map((door) => {
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

                                            <Tooltip title={door.isActive ? 'Deactivate door' : 'Activate door'}>
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