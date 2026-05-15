import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
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
import {
    AccessTargetType,
    type AccessRuleDto,
} from '../../entities/access-rule/types';
import type { DoorDto } from '../../entities/door/types';
import type { GroupDto } from '../../entities/group/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { CreateAccessRuleDialog } from '../../features/access-rules/create-access-rule/create-access-rule-dialog';
import { useAccessRulesQuery } from '../../features/access-rules/list-access-rules/use-access-rules-query';
import { useToggleAccessRuleActiveMutation } from '../../features/access-rules/toggle-access-rule-active/use-toggle-access-rule-active-mutation';
import { useGroupsQuery } from '../../features/groups/list-groups/use-groups-query';
import { EmptyState } from '../../shared/ui/empty-state';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zone: ZoneDto;
    rooms: RoomDto[];
    doors: DoorDto[];
};

const dayNames: Record<number, string> = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    7: 'Sun',
};

export function ZoneRulesSection({ zone, rooms, doors }: Props) {
    const theme = useTheme();

    const [createOpen, setCreateOpen] = useState(false);

    const roomIds = useMemo(() => rooms.map((room) => room.id), [rooms]);
    const doorIds = useMemo(() => doors.map((door) => door.id), [doors]);

    const groupsQuery = useGroupsQuery({
        page: 1,
        pageSize: 100,
    });

    const rulesQuery = useAccessRulesQuery({
        page: 1,
        pageSize: 100,
    });

    const toggleMutation = useToggleAccessRuleActiveMutation();

    const rules = useMemo(() => {
        const items = rulesQuery.data?.items ?? [];

        return items.filter((rule) => {
            if (
                rule.targetType === AccessTargetType.Zone &&
                rule.targetId === zone.id
            ) {
                return true;
            }

            if (
                rule.targetType === AccessTargetType.Room &&
                roomIds.includes(rule.targetId)
            ) {
                return true;
            }

            return (
                rule.targetType === AccessTargetType.Door &&
                doorIds.includes(rule.targetId)
            );
        });
    }, [rulesQuery.data, zone.id, roomIds, doorIds]);

    const handleToggleActive = async (rule: AccessRuleDto) => {
        await toggleMutation.mutateAsync({
            id: rule.id,
            isActive: !rule.isActive,
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
                        <Typography variant="subtitle1">
                            Access rules
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Room-level, door-level and zone-level access
                            policies.
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={() => setCreateOpen(true)}
                    >
                        Add rule
                    </Button>
                </Box>

                <Divider />

                {rulesQuery.isLoading ? (
                    <LoadingState
                        title="Loading rules"
                        description="Access rules are being loaded."
                    />
                ) : rulesQuery.isError ? (
                    <ErrorState
                        title="Failed to load rules"
                        description="The access rules workspace could not be loaded."
                        onRetry={() => void rulesQuery.refetch()}
                    />
                ) : rules.length === 0 ? (
                    <EmptyState
                        title="No rules configured"
                        description="Create the first access rule for this topology."
                        action={
                            <Button
                                variant="contained"
                                startIcon={<AddOutlinedIcon />}
                                onClick={() => setCreateOpen(true)}
                            >
                                Create first rule
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
                                xl: 'repeat(2, minmax(0, 1fr))',
                            },
                            gap: 1.5,
                        }}
                    >
                        {rules.map((rule) => {
                            const group = groupsQuery.data?.items.find(
                                (g) => g.id === rule.groupId
                            );

                            const target = resolveTarget(
                                rule,
                                zone,
                                rooms,
                                doors
                            );

                            const isTogglingCurrent =
                                toggleMutation.isPending &&
                                toggleMutation.variables?.id === rule.id;

                            return (
                                <Box
                                    key={rule.id}
                                    sx={{
                                        p: 2.25,
                                        borderRadius: 4,
                                        border: '1px solid',
                                        borderColor: rule.isActive
                                            ? alpha(
                                                theme.palette.success.main,
                                                0.25
                                            )
                                            : alpha(
                                                theme.palette.warning.main,
                                                0.25
                                            ),
                                        bgcolor: alpha(
                                            theme.palette.background.paper,
                                            0.7
                                        ),
                                    }}
                                >
                                    <Stack spacing={1.75}>
                                        <Stack
                                            direction="row"
                                            spacing={1.25}
                                            alignItems="flex-start"
                                        >
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: 3,
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    bgcolor: alpha(
                                                        theme.palette.primary
                                                            .main,
                                                        0.12
                                                    ),
                                                    color: 'primary.main',
                                                }}
                                            >
                                                <RuleOutlinedIcon fontSize="small" />
                                            </Box>

                                            <Stack
                                                minWidth={0}
                                                flex={1}
                                                spacing={0.4}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    noWrap
                                                >
                                                    {group?.name ??
                                                        'Unknown group'}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    noWrap
                                                >
                                                    {group?.code ??
                                                        rule.groupId}
                                                </Typography>
                                            </Stack>

                                            <StatusChip
                                                label={
                                                    rule.isActive
                                                        ? 'Active'
                                                        : 'Inactive'
                                                }
                                                variant={
                                                    rule.isActive
                                                        ? 'success'
                                                        : 'warning'
                                                }
                                            />
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            flexWrap="wrap"
                                            useFlexGap
                                        >
                                            <TargetBadge
                                                type={rule.targetType}
                                            />

                                            <StatusChip
                                                label={target}
                                                variant="info"
                                            />
                                        </Stack>

                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 3,
                                                bgcolor: alpha(
                                                    theme.palette.primary.main,
                                                    0.05
                                                ),
                                            }}
                                        >
                                            <Stack spacing={1}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    <AccessTimeOutlinedIcon
                                                        sx={{
                                                            fontSize: 18,
                                                            color: 'text.secondary',
                                                        }}
                                                    />

                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={700}
                                                    >
                                                        Access windows
                                                    </Typography>
                                                </Stack>

                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    flexWrap="wrap"
                                                    useFlexGap
                                                >
                                                    {rule.windows.map(
                                                        (window, index) => (
                                                            <StatusChip
                                                                key={index}
                                                                label={`${dayNames[window.dayOfWeekIso]} ${window.startTime.slice(
                                                                    0,
                                                                    5
                                                                )}–${window.endTime.slice(
                                                                    0,
                                                                    5
                                                                )}`}
                                                                variant="default"
                                                            />
                                                        )
                                                    )}
                                                </Stack>
                                            </Stack>
                                        </Box>

                                        <Stack spacing={0.5}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Validity
                                            </Typography>

                                            <Typography variant="body2">
                                                {formatValidity(rule)}
                                            </Typography>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            justifyContent="flex-end"
                                        >
                                            <Tooltip
                                                title={
                                                    rule.isActive
                                                        ? 'Deactivate rule'
                                                        : 'Activate rule'
                                                }
                                            >
                                                <span>
                                                    <IconButton
                                                        onClick={() =>
                                                            void handleToggleActive(
                                                                rule
                                                            )
                                                        }
                                                        disabled={
                                                            isTogglingCurrent
                                                        }
                                                    >
                                                        {isTogglingCurrent ? (
                                                            <CircularProgress
                                                                size={18}
                                                            />
                                                        ) : rule.isActive ? (
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

            <CreateAccessRuleDialog
                open={createOpen}
                zoneId={zone.id}
                rooms={rooms}
                doors={doors}
                groups={groupsQuery.data?.items ?? []}
                onClose={() => setCreateOpen(false)}
            />
        </>
    );
}

function resolveTarget(
    rule: AccessRuleDto,
    zone: ZoneDto,
    rooms: RoomDto[],
    doors: DoorDto[]
) {
    switch (rule.targetType) {
        case AccessTargetType.Zone:
            return zone.name;

        case AccessTargetType.Room:
            return (
                rooms.find((room) => room.id === rule.targetId)?.name ??
                'Unknown room'
            );

        case AccessTargetType.Door:
            return (
                doors.find((door) => door.id === rule.targetId)?.name ??
                'Unknown door'
            );

        default:
            return 'Unknown target';
    }
}

function formatValidity(rule: AccessRuleDto) {
    if (!rule.validFrom && !rule.validTo) {
        return 'No validity restrictions';
    }

    const from = rule.validFrom
        ? new Date(rule.validFrom).toLocaleDateString()
        : 'Any start';

    const to = rule.validTo
        ? new Date(rule.validTo).toLocaleDateString()
        : 'No end';

    return `${from} → ${to}`;
}

function TargetBadge({
                         type,
                     }: {
    type: AccessTargetType;
}) {
    switch (type) {
        case AccessTargetType.Zone:
            return (
                <StatusChip
                    label="Zone"
                    variant="info"
                    icon={<PublicOutlinedIcon fontSize="inherit" />}
                />
            );

        case AccessTargetType.Room:
            return (
                <StatusChip
                    label="Room"
                    variant="warning"
                    icon={<MeetingRoomOutlinedIcon fontSize="inherit" />}
                />
            );

        case AccessTargetType.Door:
            return (
                <StatusChip
                    label="Door"
                    variant="error"
                    icon={<DoorSlidingOutlinedIcon fontSize="inherit" />}
                />
            );

        default:
            return (
                <StatusChip
                    label="Unknown"
                    variant="default"
                />
            );
    }
}