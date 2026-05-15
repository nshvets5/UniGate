import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import {
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zone: ZoneDto;
    rooms: RoomDto[];
    doors: DoorDto[];
};

export function ZoneTopologyGraph({ zone, rooms, doors }: Props) {
    const [focusedRoomId, setFocusedRoomId] = useState<string | null>(null);

    const focusedRoom = focusedRoomId
        ? rooms.find((room) => room.id === focusedRoomId) ?? null
        : null;

    const zoneDoors = doors.filter((door) => !door.roomId);

    const focusedRoomDoors = useMemo(
        () =>
            focusedRoomId
                ? doors.filter((door) => door.roomId === focusedRoomId)
                : [],
        [doors, focusedRoomId]
    );

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'auto',
            }}
        >
            <Stack spacing={2.25}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1.5}
                >
                    <Stack spacing={0.35}>
                        <Typography variant="subtitle2">Topology graph</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click a room to focus connected doors.
                        </Typography>
                    </Stack>

                    {focusedRoom ? (
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ClearOutlinedIcon />}
                            onClick={() => setFocusedRoomId(null)}
                        >
                            Reset focus
                        </Button>
                    ) : null}
                </Stack>

                {focusedRoom ? (
                    <FocusPanel room={focusedRoom} doors={focusedRoomDoors} />
                ) : null}

                <Stack spacing={2}>
                    <GraphNode
                        icon={<ApartmentOutlinedIcon />}
                        title={zone.name}
                        subtitle={`Zone · ${zone.code}`}
                        tone="primary"
                        active
                    />

                    <TreeContainer>
                        <Stack spacing={2}>
                            {rooms.map((room) => {
                                const roomDoors = doors.filter(
                                    (door) => door.roomId === room.id
                                );

                                const focused = room.id === focusedRoomId;
                                const dimmed = Boolean(focusedRoomId) && !focused;

                                return (
                                    <TreeBranch key={room.id} dimmed={dimmed}>
                                        <GraphNode
                                            icon={<MeetingRoomOutlinedIcon />}
                                            title={room.name}
                                            subtitle={`Room · ${room.code} · ${roomDoors.length} door(s)`}
                                            tone="warning"
                                            active={focused || !focusedRoomId}
                                            dimmed={dimmed}
                                            clickable
                                            onClick={() =>
                                                setFocusedRoomId((current) =>
                                                    current === room.id ? null : room.id
                                                )
                                            }
                                        />

                                        {roomDoors.length > 0 ? (
                                            <TreeContainer>
                                                <Stack spacing={1.25}>
                                                    {roomDoors.map((door) => (
                                                        <GraphNode
                                                            key={door.id}
                                                            icon={<DoorSlidingOutlinedIcon />}
                                                            title={door.name}
                                                            subtitle={`Door · ${door.code}`}
                                                            tone="error"
                                                            compact
                                                            active={
                                                                focused ||
                                                                !focusedRoomId
                                                            }
                                                            dimmed={dimmed}
                                                        />
                                                    ))}
                                                </Stack>
                                            </TreeContainer>
                                        ) : null}
                                    </TreeBranch>
                                );
                            })}

                            {zoneDoors.length > 0 ? (
                                <TreeBranch dimmed={Boolean(focusedRoomId)}>
                                    <GraphNode
                                        icon={<DoorSlidingOutlinedIcon />}
                                        title="Zone-level doors"
                                        subtitle={`${zoneDoors.length} shared entrance(s)`}
                                        tone="info"
                                        active={!focusedRoomId}
                                        dimmed={Boolean(focusedRoomId)}
                                    />

                                    <TreeContainer>
                                        <Stack spacing={1.25}>
                                            {zoneDoors.map((door) => (
                                                <GraphNode
                                                    key={door.id}
                                                    icon={<DoorSlidingOutlinedIcon />}
                                                    title={door.name}
                                                    subtitle={`Door · ${door.code}`}
                                                    tone="info"
                                                    compact
                                                    active={!focusedRoomId}
                                                    dimmed={Boolean(focusedRoomId)}
                                                />
                                            ))}
                                        </Stack>
                                    </TreeContainer>
                                </TreeBranch>
                            ) : null}
                        </Stack>
                    </TreeContainer>
                </Stack>
            </Stack>
        </Box>
    );
}

function FocusPanel({
                        room,
                        doors,
                    }: {
    room: RoomDto;
    doors: DoorDto[];
}) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'warning.main',
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
            }}
        >
            <Stack spacing={1}>
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                    useFlexGap
                >
                    <Typography variant="subtitle2">
                        Focused room: {room.name}
                    </Typography>

                    <StatusChip label={room.code} variant="warning" />
                    <StatusChip
                        label={`${doors.length} connected door(s)`}
                        variant="default"
                    />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                    Highlighting only doors directly assigned to this room. Zone-level doors
                    are dimmed because they are not room-specific.
                </Typography>
            </Stack>
        </Box>
    );
}

function TreeContainer({ children }: { children: React.ReactNode }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                ml: 2.25,
                pl: 2.25,
                borderLeft: '2px dashed',
                borderColor: alpha(theme.palette.primary.main, 0.18),
            }}
        >
            {children}
        </Box>
    );
}

function TreeBranch({
                        children,
                        dimmed,
                    }: {
    children: React.ReactNode;
    dimmed?: boolean;
}) {
    return (
        <Box
            sx={{
                opacity: dimmed ? 0.42 : 1,
                transition: 'opacity 0.18s ease',
            }}
        >
            {children}
        </Box>
    );
}

function GraphNode({
                       icon,
                       title,
                       subtitle,
                       tone,
                       compact,
                       active,
                       dimmed,
                       clickable,
                       onClick,
                   }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    tone: 'primary' | 'warning' | 'error' | 'info';
    compact?: boolean;
    active?: boolean;
    dimmed?: boolean;
    clickable?: boolean;
    onClick?: () => void;
}) {
    const theme = useTheme();

    const colorMap = {
        primary: theme.palette.primary.main,
        warning: theme.palette.warning.main,
        error: theme.palette.error.main,
        info: theme.palette.info.main,
    };

    const color = colorMap[tone];

    return (
        <Box
            component={clickable ? 'button' : 'div'}
            type={clickable ? 'button' : undefined}
            onClick={onClick}
            sx={{
                width: '100%',
                textAlign: 'left',
                p: compact ? 1.5 : 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: active
                    ? alpha(color, 0.36)
                    : alpha(theme.palette.divider, 0.75),
                bgcolor: active ? alpha(color, 0.07) : 'background.paper',
                opacity: dimmed ? 0.55 : 1,
                position: 'relative',
                overflow: 'hidden',
                cursor: clickable ? 'pointer' : 'default',
                transition:
                    'border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease, opacity 0.18s ease',
                '&:hover': clickable
                    ? {
                        transform: 'translateY(-1px)',
                        borderColor: alpha(color, 0.5),
                    }
                    : undefined,
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(90deg, ${alpha(
                        color,
                        active ? 0.07 : 0.03
                    )}, transparent)`,
                    pointerEvents: 'none',
                }}
            />

            <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{ position: 'relative', zIndex: 1 }}
            >
                <Box
                    sx={{
                        width: compact ? 34 : 42,
                        height: compact ? 34 : 42,
                        borderRadius: 2.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(color, active ? 0.14 : 0.08),
                        color,
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>

                <Stack minWidth={0}>
                    <Typography
                        variant={compact ? 'body2' : 'subtitle2'}
                        noWrap
                    >
                        {title}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" noWrap>
                        {subtitle}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}