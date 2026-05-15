import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
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
import {
    AccessTargetType,
    type AccessRuleDto,
} from '../../entities/access-rule/types';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { CreateAccessRuleDialog } from '../../features/access-rules/create-access-rule/create-access-rule-dialog';
import { useAccessRulesQuery } from '../../features/access-rules/list-access-rules/use-access-rules-query';
import { useToggleAccessRuleActiveMutation } from '../../features/access-rules/toggle-access-rule-active/use-toggle-access-rule-active-mutation';
import { useGroupsQuery } from '../../features/groups/list-groups/use-groups-query';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zone: ZoneDto;
    zones: ZoneDto[];
    rooms: RoomDto[];
    doors: DoorDto[];
};

function formatRulePeriod(rule: AccessRuleDto) {
    if (!rule.validFrom && !rule.validTo) return 'No validity period';

    const from = rule.validFrom
        ? new Date(rule.validFrom).toLocaleDateString()
        : 'Any start';

    const to = rule.validTo
        ? new Date(rule.validTo).toLocaleDateString()
        : 'No end';

    return `${from} → ${to}`;
}

function getTargetTypeLabel(type: AccessTargetType) {
    if (type === AccessTargetType.Zone) return 'Zone';
    if (type === AccessTargetType.Room) return 'Room';
    if (type === AccessTargetType.Door) return 'Door';
    return 'Unknown';
}

export function ZoneRulesSection({ zone, zones, rooms, doors }: Props) {
    const theme = useTheme();
    const [createOpen, setCreateOpen] = useState(false);

    const rulesQuery = useAccessRulesQuery({
        page: 1,
        pageSize: 200,
    });

    const groupsQuery = useGroupsQuery({ page: 1, pageSize: 100 });
    const toggleMutation = useToggleAccessRuleActiveMutation();

    const roomIds = useMemo(() => new Set(rooms.map((room) => room.id)), [rooms]);
    const doorIds = useMemo(() => new Set(doors.map((door) => door.id)), [doors]);

    const targetNameMap = useMemo(() => {
        const map = new Map<string, string>();

        for (const item of zones) {
            map.set(`${AccessTargetType.Zone}:${item.id}`, `${item.name} (${item.code})`);
        }

        for (const item of rooms) {
            map.set(`${AccessTargetType.Room}:${item.id}`, `${item.name} (${item.code})`);
        }

        for (const item of doors) {
            map.set(`${AccessTargetType.Door}:${item.id}`, `${item.name} (${item.code})`);
        }

        return map;
    }, [zones, rooms, doors]);

    const zoneRules = useMemo(() => {
        const rules = rulesQuery.data?.items ?? [];

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
                        <Typography variant="subtitle1">Access rules</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Rules may target the selected zone, its rooms or its doors.
                        </Typography>
                    </Stack>

                    <Button
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={() => setCreateOpen(true)}
                        disabled={groupsQuery.isLoading || groupsQuery.isError}
                    >
                        Add rule
                    </Button>
                </Box>

                <Divider />

                {rulesQuery.isLoading ? (
                    <LoadingState
                        title="Loading access rules"
                        description="Please wait while access rules are being loaded."
                    />
                ) : rulesQuery.isError ? (
                    <ErrorState
                        title="Failed to load access rules"
                        description="The rules list could not be loaded from the server."
                        onRetry={() => void rulesQuery.refetch()}
                    />
                ) : zoneRules.length === 0 ? (
                    <EmptyState
                        title="No access rules found"
                        description="Create a zone, room or door level access rule for this workspace."
                        action={
                            <Button
                                variant="contained"
                                startIcon={<AddOutlinedIcon />}
                                onClick={() => setCreateOpen(true)}
                                disabled={groupsQuery.isLoading || groupsQuery.isError}
                            >
                                Add first rule
                            </Button>
                        }
                    />
                ) : (
                    <Stack spacing={0} divider={<Divider />}>
                        {zoneRules.map((rule) => {
                            const isTogglingCurrent =
                                toggleMutation.isPending &&
                                toggleMutation.variables?.id === rule.id;

                            const targetLabel =
                                targetNameMap.get(`${rule.targetType}:${rule.targetId}`) ??
                                rule.targetId;

                            return (
                                <Box
                                    key={rule.id}
                                    sx={{
                                        p: 2.5,
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            lg: '44px minmax(0, 1fr) 160px 120px auto',
                                        },
                                        gap: 2,
                                        alignItems: 'center',
                                        transition: 'background-color 0.18s ease',
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.03),
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 2.5,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor:
                                                rule.targetType === AccessTargetType.Door
                                                    ? alpha(theme.palette.error.main, 0.1)
                                                    : rule.targetType === AccessTargetType.Room
                                                        ? alpha(theme.palette.warning.main, 0.12)
                                                        : alpha(theme.palette.primary.main, 0.1),
                                            color:
                                                rule.targetType === AccessTargetType.Door
                                                    ? 'error.main'
                                                    : rule.targetType === AccessTargetType.Room
                                                        ? 'warning.main'
                                                        : 'primary.main',
                                        }}
                                    >
                                        <GppGoodOutlinedIcon fontSize="small" />
                                    </Box>

                                    <Stack spacing={0.65} minWidth={0}>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <StatusChip
                                                label={getTargetTypeLabel(rule.targetType)}
                                                variant={
                                                    rule.targetType === AccessTargetType.Door
                                                        ? 'error'
                                                        : rule.targetType === AccessTargetType.Room
                                                            ? 'warning'
                                                            : 'info'
                                                }
                                            />
                                            <CodeBadge value={`${rule.windows?.length ?? 0} window(s)`} />
                                        </Stack>

                                        <Typography variant="subtitle2" noWrap>
                                            {targetLabel}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            {formatRulePeriod(rule)}
                                        </Typography>
                                    </Stack>

                                    <Stack spacing={0.35}>
                                        <Typography variant="caption" color="text.secondary">
                                            Group
                                        </Typography>
                                        <Typography variant="body2" noWrap>
                                            {rule.groupId}
                                        </Typography>
                                    </Stack>

                                    <StatusChip
                                        label={rule.isActive ? 'Active' : 'Inactive'}
                                        variant={rule.isActive ? 'success' : 'warning'}
                                    />

                                    <Stack direction="row" justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
                                        <Tooltip
                                            title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                                        >
                                            <span>
                                                <IconButton
                                                    onClick={() => void handleToggleActive(rule)}
                                                    disabled={isTogglingCurrent}
                                                >
                                                    {isTogglingCurrent ? (
                                                        <CircularProgress size={18} />
                                                    ) : rule.isActive ? (
                                                        <PauseCircleOutlineOutlinedIcon />
                                                    ) : (
                                                        <PlayCircleOutlineOutlinedIcon />
                                                    )}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </SectionCard>

            <CreateAccessRuleDialog
                open={createOpen}
                defaultTargetType={AccessTargetType.Zone}
                defaultTargetId={zone.id}
                zones={zones}
                rooms={rooms}
                doors={doors}
                groups={groupsQuery.data?.items ?? []}
                onClose={() => setCreateOpen(false)}
            />
        </>
    );
}