import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { AccessTargetType } from '../../entities/access-rule/types';
import type { ZoneDto } from '../../entities/zone/types';
import { useAccessRulesQuery } from '../../features/access-rules/list-access-rules/use-access-rules-query';
import { useDoorsQuery } from '../../features/doors/list-doors/use-doors-query';
import { useRoomsQuery } from '../../features/rooms/list-rooms/use-rooms-query';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';
import { ZoneDoorsSection } from './zone-doors-section';
import { ZoneRoomsSection } from './zone-rooms-section';
import { ZoneRulesSection } from './zone-rules-section';
import { ZoneTopologySection } from './zone-topology-section';

type Props = {
    zone: ZoneDto | null;
    zones: ZoneDto[];
    onEdit: (zone: ZoneDto) => void;
    onToggleActive: (zone: ZoneDto) => void;
    isTogglePending: boolean;
};

type TabValue = 'overview' | 'rooms' | 'doors' | 'rules';

export function ZoneDetailsPanel({
                                     zone,
                                     zones,
                                     onEdit,
                                     onToggleActive,
                                     isTogglePending,
                                 }: Props) {
    const theme = useTheme();
    const [tab, setTab] = useState<TabValue>('overview');

    const roomsQuery = useRoomsQuery({ page: 1, pageSize: 200 });
    const doorsQuery = useDoorsQuery({
        zoneId: zone?.id,
        page: 1,
        pageSize: 200,
    });
    const rulesQuery = useAccessRulesQuery({ page: 1, pageSize: 200 });

    const rooms = useMemo(
        () => (roomsQuery.data?.items ?? []).filter((room) => room.zoneId === zone?.id),
        [roomsQuery.data, zone?.id]
    );

    const doors = doorsQuery.data?.items ?? [];
    const rules = rulesQuery.data?.items ?? [];

    const ruleCount = useMemo(() => {
        if (!zone) return 0;

        const roomIds = new Set(rooms.map((room) => room.id));
        const doorIds = new Set(doors.map((door) => door.id));

        return rules.filter((rule) => {
            if (rule.targetType === AccessTargetType.Zone && rule.targetId === zone.id) {
                return true;
            }

            if (rule.targetType === AccessTargetType.Room && roomIds.has(rule.targetId)) {
                return true;
            }

            if (rule.targetType === AccessTargetType.Door && doorIds.has(rule.targetId)) {
                return true;
            }

            return false;
        }).length;
    }, [zone, rooms, doors, rules]);

    if (!zone) {
        return (
            <SectionCard>
                <EmptyState
                    title="No zone selected"
                    description="Select a zone from the access tree to manage rooms, doors and policies."
                />
            </SectionCard>
        );
    }

    return (
        <Stack spacing={3}>
            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        gap={2}
                    >
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <CodeBadge value={zone.code} />
                                <StatusChip
                                    label={zone.isActive ? 'Active' : 'Inactive'}
                                    variant={zone.isActive ? 'success' : 'warning'}
                                />
                            </Stack>

                            <Stack spacing={0.5}>
                                <Typography variant="h5" fontWeight={800}>
                                    {zone.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Zone workspace with room, door and rule targets.
                                </Typography>
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                startIcon={<EditOutlinedIcon />}
                                onClick={() => onEdit(zone)}
                            >
                                Edit zone
                            </Button>

                            <Button
                                variant="outlined"
                                color={zone.isActive ? 'warning' : 'success'}
                                startIcon={
                                    isTogglePending ? (
                                        <CircularProgress size={16} />
                                    ) : zone.isActive ? (
                                        <PauseCircleOutlineOutlinedIcon />
                                    ) : (
                                        <PlayCircleOutlineOutlinedIcon />
                                    )
                                }
                                onClick={() => onToggleActive(zone)}
                                disabled={isTogglePending}
                            >
                                {zone.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                        </Stack>
                    </Stack>
                </Box>

                <Divider />

                <Tabs
                    value={tab}
                    onChange={(_, value) => setTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        px: 2,
                        minHeight: 52,
                        '& .MuiTab-root': {
                            minHeight: 52,
                            textTransform: 'none',
                            fontWeight: 700,
                        },
                    }}
                >
                    <Tab value="overview" label="Overview" />
                    <Tab value="rooms" label={`Rooms (${rooms.length})`} />
                    <Tab value="doors" label={`Doors (${doors.length})`} />
                    <Tab value="rules" label={`Rules (${ruleCount})`} />
                </Tabs>
            </SectionCard>

            {tab === 'overview' ? (
                <ZoneTopologySection
                    zone={zone}
                    rooms={rooms}
                    doors={doors}
                    ruleCount={ruleCount}
                />
            ) : null}

            {tab === 'rooms' ? (
                <ZoneRoomsSection zone={zone} rooms={rooms} isLoading={roomsQuery.isLoading} />
            ) : null}

            {tab === 'doors' ? <ZoneDoorsSection zone={zone} rooms={rooms} /> : null}

            {tab === 'rules' ? (
                <ZoneRulesSection zone={zone} zones={zones} rooms={rooms} doors={doors} />
            ) : null}
        </Stack>
    );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: 0.75 }}>
                {value}
            </Typography>
        </Box>
    );
}