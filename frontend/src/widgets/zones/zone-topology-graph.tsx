import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import {
    Box,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';

type Props = {
    zone: ZoneDto;
    rooms: RoomDto[];
    doors: DoorDto[];
};

export function ZoneTopologyGraph({
                                      zone,
                                      rooms,
                                      doors,
                                  }: Props) {
    const theme = useTheme();

    const zoneDoors = doors.filter((door) => !door.roomId);

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.paper, 0.65),
                overflow: 'auto',
            }}
        >
            <Stack spacing={2}>
                <GraphNode
                    icon={<ApartmentOutlinedIcon />}
                    title={zone.name}
                    subtitle={`Zone · ${zone.code}`}
                    tone="primary"
                />

                <TreeContainer>
                    <Stack spacing={2}>
                        {rooms.map((room) => {
                            const roomDoors = doors.filter(
                                (door) => door.roomId === room.id
                            );

                            return (
                                <TreeBranch key={room.id}>
                                    <GraphNode
                                        icon={<MeetingRoomOutlinedIcon />}
                                        title={room.name}
                                        subtitle={`Room · ${room.code}`}
                                        tone="warning"
                                    />

                                    {roomDoors.length > 0 ? (
                                        <TreeContainer>
                                            <Stack spacing={1.25}>
                                                {roomDoors.map((door) => (
                                                    <GraphNode
                                                        key={door.id}
                                                        icon={
                                                            <DoorSlidingOutlinedIcon />
                                                        }
                                                        title={door.name}
                                                        subtitle={`Door · ${door.code}`}
                                                        tone="error"
                                                        compact
                                                    />
                                                ))}
                                            </Stack>
                                        </TreeContainer>
                                    ) : null}
                                </TreeBranch>
                            );
                        })}

                        {zoneDoors.length > 0 ? (
                            <TreeBranch>
                                <GraphNode
                                    icon={<DoorSlidingOutlinedIcon />}
                                    title="Zone-level doors"
                                    subtitle={`${zoneDoors.length} shared entrances`}
                                    tone="info"
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
                                            />
                                        ))}
                                    </Stack>
                                </TreeContainer>
                            </TreeBranch>
                        ) : null}
                    </Stack>
                </TreeContainer>
            </Stack>
        </Box>
    );
}

function TreeContainer({
                           children,
                       }: {
    children: React.ReactNode;
}) {
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
                    }: {
    children: React.ReactNode;
}) {
    return (
        <Box
            sx={{
                position: 'relative',
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
                   }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    tone: 'primary' | 'warning' | 'error' | 'info';
    compact?: boolean;
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
            sx={{
                p: compact ? 1.5 : 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: alpha(color, 0.24),
                bgcolor: alpha(color, 0.06),
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(
                        90deg,
                        ${alpha(color, 0.06)},
                        transparent
                    )`,
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
                        bgcolor: alpha(color, 0.12),
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

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                    >
                        {subtitle}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}