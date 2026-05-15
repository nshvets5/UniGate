import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
    Box,
    Button,
    Divider,
    InputAdornment,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { AccessTargetType } from '../../entities/access-rule/types';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { useAccessRulesQuery } from '../../features/access-rules/list-access-rules/use-access-rules-query';
import { useDoorsQuery } from '../../features/doors/list-doors/use-doors-query';
import { useRoomsQuery } from '../../features/rooms/list-rooms/use-rooms-query';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zones: ZoneDto[];
    selectedZoneId: string | null;
    search: string;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
    onSelectZone: (zone: ZoneDto) => void;
};

export function ZoneAccessTreePanel({
                                        zones,
                                        selectedZoneId,
                                        search,
                                        isLoading,
                                        onSearchChange,
                                        onCreateClick,
                                        onSelectZone,
                                    }: Props) {
    const theme = useTheme();

    const roomsQuery = useRoomsQuery({ page: 1, pageSize: 100 });
    const doorsQuery = useDoorsQuery({ page: 1, pageSize: 100 });
    const rulesQuery = useAccessRulesQuery({
        isActive: undefined,
        page: 1,
        pageSize: 100,
    });

    const rooms = roomsQuery.data?.items ?? [];
    const doors = doorsQuery.data?.items ?? [];
    const rules = rulesQuery.data?.items ?? [];

    const treeByZone = useMemo(() => {
        return zones.reduce<
            Record<
                string,
                {
                    rooms: RoomDto[];
                    doors: DoorDto[];
                    zoneDoors: DoorDto[];
                    rules: {
                        zone: number;
                        room: number;
                        door: number;
                    };
                }
            >
        >((acc, zone) => {
            const zoneRooms = rooms.filter((room) => room.zoneId === zone.id);
            const zoneDoors = doors.filter((door) => door.zoneId === zone.id);
            const zoneLevelDoors = zoneDoors.filter((door) => !door.roomId);

            const roomIds = new Set(zoneRooms.map((room) => room.id));
            const doorIds = new Set(zoneDoors.map((door) => door.id));

            acc[zone.id] = {
                rooms: zoneRooms,
                doors: zoneDoors,
                zoneDoors: zoneLevelDoors,
                rules: {
                    zone: rules.filter(
                        (rule) =>
                            rule.targetType === AccessTargetType.Zone &&
                            rule.targetId === zone.id
                    ).length,
                    room: rules.filter(
                        (rule) =>
                            rule.targetType === AccessTargetType.Room &&
                            roomIds.has(rule.targetId)
                    ).length,
                    door: rules.filter(
                        (rule) =>
                            rule.targetType === AccessTargetType.Door &&
                            doorIds.has(rule.targetId)
                    ).length,
                },
            };

            return acc;
        }, {});
    }, [zones, rooms, doors, rules]);

    const isTreeLoading =
        isLoading || roomsQuery.isLoading || doorsQuery.isLoading || rulesQuery.isLoading;

    return (
        <SectionCard
            sx={{
                p: 0,
                overflow: 'hidden',
                position: { xl: 'sticky' },
                top: { xl: 96 },
            }}
        >
            <Box sx={{ p: 3 }}>
                <Stack spacing={2.25}>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">Campus access tree</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Browse zones, rooms, doors and rule targets.
                            </Typography>
                        </Stack>

                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddOutlinedIcon />}
                            onClick={onCreateClick}
                        >
                            Zone
                        </Button>
                    </Stack>

                    <TextField
                        fullWidth
                        size="small"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search zones..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlinedIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ p: 1.5 }}>
                {isTreeLoading ? (
                    <Stack spacing={1}>
                        {[1, 2, 3].map((item) => (
                            <Skeleton key={item} height={170} sx={{ borderRadius: 3 }} />
                        ))}
                    </Stack>
                ) : zones.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="subtitle2">No zones found</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Create a zone to start building the access structure.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.25}>
                        {zones.map((zone) => {
                            const selected = zone.id === selectedZoneId;
                            const tree = treeByZone[zone.id] ?? {
                                rooms: [],
                                doors: [],
                                zoneDoors: [],
                                rules: { zone: 0, room: 0, door: 0 },
                            };

                            return (
                                <Box
                                    key={zone.id}
                                    component="button"
                                    type="button"
                                    onClick={() => onSelectZone(zone)}
                                    sx={{
                                        width: '100%',
                                        textAlign: 'left',
                                        border: '1px solid',
                                        borderColor: selected
                                            ? alpha(theme.palette.primary.main, 0.45)
                                            : 'divider',
                                        bgcolor: selected
                                            ? alpha(
                                                theme.palette.primary.main,
                                                theme.palette.mode === 'dark' ? 0.14 : 0.07
                                            )
                                            : 'background.paper',
                                        borderRadius: 3,
                                        p: 1.75,
                                        cursor: 'pointer',
                                        transition:
                                            'border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease',
                                        '&:hover': {
                                            borderColor: alpha(theme.palette.primary.main, 0.55),
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                >
                                    <Stack spacing={1.4}>
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            <TreeIcon tone="primary">
                                                <AccountTreeOutlinedIcon fontSize="small" />
                                            </TreeIcon>

                                            <Stack minWidth={0} flex={1}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {zone.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {zone.code}
                                                </Typography>
                                            </Stack>

                                            <StatusChip
                                                label={zone.isActive ? 'Active' : 'Inactive'}
                                                variant={zone.isActive ? 'success' : 'warning'}
                                            />
                                        </Stack>

                                        <Box
                                            sx={{
                                                ml: 2.5,
                                                pl: 2,
                                                borderLeft: '1px dashed',
                                                borderColor: alpha(theme.palette.text.secondary, 0.24),
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <TreeGroup
                                                    icon={<MeetingRoomOutlinedIcon fontSize="small" />}
                                                    label="Rooms"
                                                    count={tree.rooms.length}
                                                >
                                                    {tree.rooms.slice(0, 4).map((room) => (
                                                        <TreeLeaf
                                                            key={room.id}
                                                            label={room.name}
                                                            meta={room.code}
                                                            inactive={!room.isActive}
                                                        />
                                                    ))}

                                                    {tree.rooms.length > 4 ? (
                                                        <TreeMore count={tree.rooms.length - 4} />
                                                    ) : null}
                                                </TreeGroup>

                                                <TreeGroup
                                                    icon={<DoorSlidingOutlinedIcon fontSize="small" />}
                                                    label="Zone-level doors"
                                                    count={tree.zoneDoors.length}
                                                >
                                                    {tree.zoneDoors.slice(0, 3).map((door) => (
                                                        <TreeLeaf
                                                            key={door.id}
                                                            label={door.name}
                                                            meta={door.code}
                                                            inactive={!door.isActive}
                                                        />
                                                    ))}

                                                    {tree.zoneDoors.length > 3 ? (
                                                        <TreeMore count={tree.zoneDoors.length - 3} />
                                                    ) : null}
                                                </TreeGroup>

                                                <TreeGroup
                                                    icon={<RuleOutlinedIcon fontSize="small" />}
                                                    label="Rules"
                                                    count={
                                                        tree.rules.zone +
                                                        tree.rules.room +
                                                        tree.rules.door
                                                    }
                                                >
                                                    <TreeLeaf label="Zone rules" meta={String(tree.rules.zone)} />
                                                    <TreeLeaf label="Room rules" meta={String(tree.rules.room)} />
                                                    <TreeLeaf label="Door rules" meta={String(tree.rules.door)} />
                                                </TreeGroup>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </SectionCard>
    );
}

function TreeIcon({
                      children,
                      tone,
                  }: {
    children: React.ReactNode;
    tone: 'primary' | 'muted';
}) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor:
                    tone === 'primary'
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.text.secondary, 0.08),
                color: tone === 'primary' ? 'primary.main' : 'text.secondary',
            }}
        >
            {children}
        </Box>
    );
}

function TreeGroup({
                       icon,
                       label,
                       count,
                       children,
                   }: {
    icon: React.ReactNode;
    label: string;
    count: number;
    children: React.ReactNode;
}) {
    return (
        <Stack spacing={0.55}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                    {label}
                </Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                    {count}
                </Typography>
            </Stack>

            {count > 0 ? (
                <Box
                    sx={{
                        ml: 1.25,
                        pl: 1.75,
                        borderLeft: '1px dashed',
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={0.4}>{children}</Stack>
                </Box>
            ) : null}
        </Stack>
    );
}

function TreeLeaf({
                      label,
                      meta,
                      inactive,
                  }: {
    label: string;
    meta: string;
    inactive?: boolean;
}) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
            <Box
                sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: inactive ? 'warning.main' : 'success.main',
                    flexShrink: 0,
                }}
            />

            <Typography
                variant="caption"
                color={inactive ? 'text.disabled' : 'text.secondary'}
                noWrap
                sx={{ flex: 1 }}
            >
                {label}
            </Typography>

            <Typography variant="caption" color="text.disabled" noWrap>
                {meta}
            </Typography>
        </Stack>
    );
}

function TreeMore({ count }: { count: number }) {
    return (
        <Typography variant="caption" color="text.disabled">
            +{count} more
        </Typography>
    );
}