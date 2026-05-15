import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { CodeBadge } from '../../shared/ui/code-badge';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';
import { ZoneTopologyGraph } from './zone-topology-graph';

type Props = {
    zone: ZoneDto;
    rooms: RoomDto[];
    doors: DoorDto[];
    ruleCount: number;
};

export function ZoneTopologySection({ zone, rooms, doors, ruleCount }: Props) {
    const theme = useTheme();

    const zoneLevelDoors = doors.filter((door) => !door.roomId);
    const roomLevelDoors = doors.filter((door) => door.roomId);

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.12),
                            color: 'primary.main',
                        }}
                    >
                        <AccountTreeOutlinedIcon />
                    </Box>

                    <Stack spacing={0.5}>
                        <Typography variant="subtitle1">Access topology</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Physical structure and rule resolution for this access zone.
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ p: 3 }}>
                <Stack spacing={2.25}>
                    <TopologyRoot
                        title={zone.name}
                        subtitle="Zone boundary"
                        code={zone.code}
                        active={zone.isActive}
                    />

                    <Box
                        sx={{
                            ml: 2.75,
                            pl: 2.5,
                            borderLeft: '1px dashed',
                            borderColor: alpha(theme.palette.text.secondary, 0.25),
                        }}
                    >
                        <Stack spacing={1.75}>
                            <TopologyBranch
                                icon={<MeetingRoomOutlinedIcon fontSize="small" />}
                                title="Rooms"
                                count={rooms.length}
                                description="Room-level rules grant access only to specific rooms."
                            >
                                {rooms.slice(0, 4).map((room) => (
                                    <TopologyLeaf
                                        key={room.id}
                                        label={room.name}
                                        meta={room.code}
                                        active={room.isActive}
                                    />
                                ))}
                            </TopologyBranch>

                            <TopologyBranch
                                icon={<DoorSlidingOutlinedIcon fontSize="small" />}
                                title="Doors"
                                count={doors.length}
                                description={`${zoneLevelDoors.length} zone-level · ${roomLevelDoors.length} room-level`}
                            >
                                {doors.slice(0, 4).map((door) => (
                                    <TopologyLeaf
                                        key={door.id}
                                        label={door.name}
                                        meta={door.code}
                                        active={door.isActive}
                                    />
                                ))}
                            </TopologyBranch>

                            <TopologyBranch
                                icon={<RuleOutlinedIcon fontSize="small" />}
                                title="Rule resolution"
                                count={ruleCount}
                                description="Backend checks the most specific target first."
                            >
                                <ResolutionFlow />
                            </TopologyBranch>
                        </Stack>
                    </Box>
                </Stack>

                <ZoneTopologyGraph
                    zone={zone}
                    rooms={rooms}
                    doors={doors}
                />
            </Box>
        </SectionCard>
    );
}

function TopologyRoot({
                          title,
                          subtitle,
                          code,
                          active,
                      }: {
    title: string;
    subtitle: string;
    code: string;
    active: boolean;
}) {
    return (
        <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
                sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: active ? 'success.main' : 'warning.main',
                    flexShrink: 0,
                }}
            />

            <Stack minWidth={0} flex={1}>
                <Typography variant="h6" noWrap>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <CodeBadge value={code} />
                <StatusChip
                    label={active ? 'Active' : 'Inactive'}
                    variant={active ? 'success' : 'warning'}
                />
            </Stack>
        </Stack>
    );
}

function TopologyBranch({
                            icon,
                            title,
                            count,
                            description,
                            children,
                        }: {
    icon: React.ReactNode;
    title: string;
    count: number;
    description: string;
    children: React.ReactNode;
}) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: alpha(theme.palette.background.paper, 0.65),
            }}
        >
            <Stack spacing={1.25}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            borderRadius: 2.25,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                        }}
                    >
                        {icon}
                    </Box>

                    <Stack minWidth={0} flex={1}>
                        <Typography variant="subtitle2">
                            {title} · {count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {description}
                        </Typography>
                    </Stack>
                </Stack>

                <Box
                    sx={{
                        ml: 1.7,
                        pl: 2,
                        borderLeft: '1px dashed',
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={0.65}>{children}</Stack>
                </Box>
            </Stack>
        </Box>
    );
}

function TopologyLeaf({
                          label,
                          meta,
                          active,
                      }: {
    label: string;
    meta: string;
    active: boolean;
}) {
    return (
        <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
            <Box
                sx={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: active ? 'success.main' : 'warning.main',
                    flexShrink: 0,
                }}
            />

            <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                {label}
            </Typography>

            <Typography variant="caption" color="text.secondary" noWrap>
                {meta}
            </Typography>
        </Stack>
    );
}

function ResolutionFlow() {
    return (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <StatusChip label="Door" variant="error" />
            <Typography variant="body2" color="text.secondary">
                →
            </Typography>
            <StatusChip label="Room" variant="warning" />
            <Typography variant="body2" color="text.secondary">
                →
            </Typography>
            <StatusChip label="Zone" variant="info" />
        </Stack>
    );
}