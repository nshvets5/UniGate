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
import { useMemo, useState } from 'react';
import { AccessTargetType, type AccessRuleDto } from '../../entities/access-rule/types';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';
import { ZoneDoorsSection } from './zone-doors-section';
import { ZoneInsightsSection } from './zone-insights-section';
import { ZoneRoomsSection } from './zone-rooms-section';
import { ZoneRulesSection } from './zone-rules-section';
import { ZoneTopologySection } from './zone-topology-section';

type Props = {
    zone: ZoneDto | null;
    zones: ZoneDto[];
    rooms: RoomDto[];
    doors: DoorDto[];
    rules: AccessRuleDto[];
    roomsLoading: boolean;
    doorsLoading: boolean;
    rulesLoading: boolean;
    onEdit: (zone: ZoneDto) => void;
    onToggleActive: (zone: ZoneDto) => void;
    isTogglePending: boolean;
};

type TabValue = 'overview' | 'rooms' | 'doors' | 'rules';

export function ZoneDetailsPanel({
                                     zone,
                                     zones,
                                     rooms,
                                     doors,
                                     rules,
                                     roomsLoading,
                                     doorsLoading,
                                     rulesLoading,
                                     onEdit,
                                     onToggleActive,
                                     isTogglePending,
                                 }: Props) {
    const [tab, setTab] = useState<TabValue>('overview');

    const zoneRooms = useMemo(
        () => (zone ? rooms.filter((room) => room.zoneId === zone.id) : []),
        [rooms, zone]
    );

    const zoneDoors = useMemo(
        () => (zone ? doors.filter((door) => door.zoneId === zone.id) : []),
        [doors, zone]
    );

    const zoneRules = useMemo(() => {
        if (!zone) return [];

        const roomIds = new Set(zoneRooms.map((room) => room.id));
        const doorIds = new Set(zoneDoors.map((door) => door.id));

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
        });
    }, [zone, zoneRooms, zoneDoors, rules]);

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
                    <Tab value="rooms" label={`Rooms (${zoneRooms.length})`} />
                    <Tab value="doors" label={`Doors (${zoneDoors.length})`} />
                    <Tab value="rules" label={`Rules (${zoneRules.length})`} />
                </Tabs>
            </SectionCard>

            {tab === 'overview' ? (
                <>
                    <ZoneTopologySection
                        zone={zone}
                        rooms={zoneRooms}
                        doors={zoneDoors}
                        ruleCount={zoneRules.length}
                    />

                    <ZoneInsightsSection
                        rooms={zoneRooms}
                        doors={zoneDoors}
                        rules={zoneRules}
                    />
                </>
            ) : null}

            {tab === 'rooms' ? (
                <ZoneRoomsSection
                    zone={zone}
                    rooms={zoneRooms}
                    isLoading={roomsLoading}
                />
            ) : null}

            {tab === 'doors' ? (
                <ZoneDoorsSection
                    zone={zone}
                    rooms={zoneRooms}
                    doors={zoneDoors}
                    isLoading={doorsLoading}
                />
            ) : null}

            {tab === 'rules' ? (
                <ZoneRulesSection
                    zone={zone}
                    rooms={zoneRooms}
                    doors={zoneDoors}
                    rules={zoneRules}
                    isLoading={rulesLoading}
                />
            ) : null}
        </Stack>
    );
}