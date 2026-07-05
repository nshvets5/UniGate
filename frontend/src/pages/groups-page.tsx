import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import ToggleOnOutlinedIcon from '@mui/icons-material/ToggleOnOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Pagination,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { GroupDto } from '../entities/group/types';
import { CreateGroupDialog } from '../features/groups/create-group/create-group-dialog';
import { useGroupsQuery } from '../features/groups/list-groups/use-groups-query';
import { useToggleGroupActiveMutation } from '../features/groups/toggle-group-active/use-toggle-group-active-mutation';
import { UpdateGroupDialog } from '../features/groups/update-group/update-group-dialog';
import { CodeBadge } from '../shared/ui/code-badge';
import { EmptyState } from '../shared/ui/empty-state';
import { EntityRow } from '../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../shared/ui/entity-table';
import { EntityToolbar } from '../shared/ui/entity-toolbar';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { RowActions } from '../shared/ui/row-actions';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

const PAGE_SIZE = 20;

export function GroupsPage() {
    const { t } = useTranslation();
    const theme = useTheme();

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupDto | null>(null);

    const desktopColumns = 'minmax(320px, 2fr) 150px 150px 150px';

    const queryParams = useMemo(
        () => ({
            search: search || undefined,
            page,
            pageSize: PAGE_SIZE,
        }),
        [search, page]
    );

    const groupsQuery = useGroupsQuery(queryParams);
    const toggleMutation = useToggleGroupActiveMutation();

    const groups = groupsQuery.data?.items ?? [];
    const totalCount = groupsQuery.data?.totalCount ?? 0;
    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const stats = useMemo(() => {
        const activeOnPage = groups.filter((group) => group.isActive).length;
        const latestAdmission = groups.length
            ? Math.max(...groups.map((group) => group.admissionYear))
            : null;

        return {
            total: totalCount,
            pageGroups: groups.length,
            activeOnPage,
            latestAdmission,
        };
    }, [groups, totalCount]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleToggleActive = async (group: GroupDto) => {
        await toggleMutation.mutateAsync({
            id: group.id,
            isActive: !group.isActive,
        });
    };

    return (
        <PageContainer>
            <PageHeader
                title={t('pages.groups.title')}
                subtitle={t('pages.groups.subtitle')}
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        xl: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 2,
                }}
            >
                <GroupMetricCard
                    icon={<GroupsOutlinedIcon />}
                    title={t('groups.total')}
                    value={stats.total}
                    description={t('groups.found', { count: stats.total })}
                    tone="primary"
                />

                <GroupMetricCard
                    icon={<GroupsOutlinedIcon />}
                    title={t('groups.pageGroups')}
                    value={stats.pageGroups}
                    description={t('groups.pageGroupsDescription')}
                    tone="info"
                />

                <GroupMetricCard
                    icon={<ToggleOnOutlinedIcon />}
                    title={t('groups.activeOnPage')}
                    value={stats.activeOnPage}
                    description={t('groups.activeOnPageDescription')}
                    tone="success"
                />

                <GroupMetricCard
                    icon={<SchoolOutlinedIcon />}
                    title={t('groups.latestAdmission')}
                    value={stats.latestAdmission ?? '—'}
                    description={t('groups.year')}
                    tone="info"
                />
            </Box>

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Stack spacing={0}>
                    <Box sx={{ p: 3 }}>
                        <Stack
                            direction={{ xs: 'column', lg: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'stretch', lg: 'center' }}
                            spacing={2}
                        >
                            <Stack spacing={0.75}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="subtitle1">
                                        {t('pages.groups.title')}
                                    </Typography>

                                    <StatusChip
                                        label={t('groups.found', { count: totalCount })}
                                        variant="info"
                                    />
                                </Stack>

                                <Typography variant="body2" color="text.secondary">
                                    {t('pages.groups.subtitle')}
                                </Typography>
                            </Stack>

                            <Button
                                variant="contained"
                                startIcon={<AddOutlinedIcon />}
                                onClick={() => setCreateOpen(true)}
                            >
                                {t('groups.create')}
                            </Button>
                        </Stack>
                    </Box>

                    <Divider />

                    <Box sx={{ p: 3 }}>
                        <EntityToolbar
                            searchValue={search}
                            onSearchChange={handleSearchChange}
                            searchPlaceholder={t('groups.search')}
                        />
                    </Box>

                    <Divider />

                    {groupsQuery.isLoading ? (
                        <LoadingState
                            title={t('states.loadingGroups', 'Loading groups')}
                            description={t(
                                'states.loadingGroupsDescription',
                                'Please wait while academic groups are being loaded.'
                            )}
                        />
                    ) : groupsQuery.isError ? (
                        <ErrorState
                            title={t('states.failedToLoadGroups', 'Failed to load groups')}
                            description={t(
                                'states.failedToLoadGroupsDescription',
                                'The groups list could not be loaded from the server.'
                            )}
                            onRetry={() => void groupsQuery.refetch()}
                        />
                    ) : groups.length === 0 ? (
                        <EmptyState
                            title={t('groups.empty')}
                            description={t('groups.emptyDescription')}
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    {t('groups.createFirst')}
                                </Button>
                            }
                        />
                    ) : (
                        <Stack spacing={0} sx={{ p: 2.25 }}>
                            <EntityTable
                                gridTemplateColumns={desktopColumns}
                                columns={
                                    <>
                                        <EntityTableHeaderCell>
                                            {t('groups.group')}
                                        </EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="center">
                                            {t('groups.year')}
                                        </EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="center">
                                            {t('groups.status')}
                                        </EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="right">
                                            {t('groups.actions')}
                                        </EntityTableHeaderCell>
                                    </>
                                }
                            >
                                {groups.map((group) => {
                                    const isTogglingCurrent =
                                        toggleMutation.isPending &&
                                        toggleMutation.variables?.id === group.id;

                                    const accentColor = group.isActive
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main;

                                    return (
                                        <EntityRow key={group.id} accentColor={accentColor}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: '1fr',
                                                        md: desktopColumns,
                                                    },
                                                    alignItems: 'center',
                                                    columnGap: 2,
                                                    rowGap: 1.5,
                                                    pl: { xs: 0, md: 1.25 },
                                                }}
                                            >
                                                <Stack spacing={0.7} minWidth={0}>
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                        minWidth={0}
                                                    >
                                                        <Typography variant="subtitle1" noWrap>
                                                            {group.name}
                                                        </Typography>

                                                        <CodeBadge value={group.code} />
                                                    </Stack>

                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                        {t('groups.created')}{' '}
                                                        {new Date(group.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Stack>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: { xs: 'flex-start', md: 'center' },
                                                        minHeight: 40,
                                                    }}
                                                >
                                                    <StatusChip
                                                        label={String(group.admissionYear)}
                                                        variant="info"
                                                    />
                                                </Box>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: { xs: 'flex-start', md: 'center' },
                                                        minHeight: 40,
                                                    }}
                                                >
                                                    <StatusChip
                                                        label={
                                                            group.isActive
                                                                ? t('common.active')
                                                                : t('common.inactive')
                                                        }
                                                        variant={group.isActive ? 'success' : 'warning'}
                                                    />
                                                </Box>

                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                                    alignItems="center"
                                                >
                                                    <RowActions>
                                                        <Tooltip title={t('groups.edit')}>
                                                            <IconButton onClick={() => setEditingGroup(group)}>
                                                                <EditOutlinedIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={
                                                                group.isActive
                                                                    ? t('groups.deactivate')
                                                                    : t('groups.activate')
                                                            }
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    onClick={() => void handleToggleActive(group)}
                                                                    disabled={isTogglingCurrent}
                                                                >
                                                                    {isTogglingCurrent ? (
                                                                        <CircularProgress size={18} />
                                                                    ) : group.isActive ? (
                                                                        <PauseCircleOutlineOutlinedIcon />
                                                                    ) : (
                                                                        <PlayCircleOutlineOutlinedIcon />
                                                                    )}
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </RowActions>
                                                </Stack>
                                            </Box>
                                        </EntityRow>
                                    );
                                })}
                            </EntityTable>

                            {totalPages > 1 ? (
                                <>
                                    <Divider sx={{ my: 2 }} />

                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            py: 1,
                                        }}
                                    >
                                        <Pagination
                                            page={page}
                                            count={totalPages}
                                            onChange={(_, value) => setPage(value)}
                                            color="primary"
                                            shape="rounded"
                                        />
                                    </Box>
                                </>
                            ) : null}
                        </Stack>
                    )}
                </Stack>
            </SectionCard>

            <CreateGroupDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />

            <UpdateGroupDialog
                open={Boolean(editingGroup)}
                group={editingGroup}
                onClose={() => setEditingGroup(null)}
            />
        </PageContainer>
    );
}

function GroupMetricCard({
                             icon,
                             title,
                             value,
                             description,
                             tone,
                         }: {
    icon: ReactNode;
    title: string;
    value: string | number;
    description: string;
    tone: 'primary' | 'success' | 'warning' | 'info';
}) {
    const theme = useTheme();

    const color =
        tone === 'success'
            ? theme.palette.success.main
            : tone === 'warning'
                ? theme.palette.warning.main
                : tone === 'info'
                    ? theme.palette.info.main
                    : theme.palette.primary.main;

    return (
        <SectionCard>
            <Stack spacing={1.5}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(color, 0.12),
                        color,
                    }}
                >
                    {icon}
                </Box>

                <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>

                    <Typography variant="h5" fontWeight={900}>
                        {value}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                        {description}
                    </Typography>
                </Stack>
            </Stack>
        </SectionCard>
    );
}