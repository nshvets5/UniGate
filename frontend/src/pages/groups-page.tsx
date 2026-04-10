import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GroupDto } from '../entities/group/types';
import { CreateGroupDialog } from '../features/groups/create-group/create-group-dialog';
import { useGroupsQuery } from '../features/groups/list-groups/use-groups-query';
import { useToggleGroupActiveMutation } from '../features/groups/toggle-group-active/use-toggle-group-active-mutation';
import { UpdateGroupDialog } from '../features/groups/update-group/update-group-dialog';
import { EmptyState } from '../shared/ui/empty-state';
import { EntityRow } from '../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../shared/ui/entity-table';
import { EntityToolbar } from '../shared/ui/entity-toolbar';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

export function GroupsPage() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupDto | null>(null);

    const queryParams = useMemo(
        () => ({
            search: search || undefined,
            page: 1,
            pageSize: 20,
        }),
        [search]
    );

    const groupsQuery = useGroupsQuery(queryParams);
    const toggleMutation = useToggleGroupActiveMutation();

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
                subtitle="Manage academic groups, lifecycle state and directory metadata."
            />

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Stack spacing={0}>
                    <Stack sx={{ p: 3 }}>
                        <EntityToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Search groups by code or name..."
                            primaryAction={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create group
                                </Button>
                            }
                        />
                    </Stack>

                    <Divider />

                    {groupsQuery.isLoading ? (
                        <LoadingState
                            title="Loading groups"
                            description="Please wait while academic groups are being loaded."
                        />
                    ) : groupsQuery.isError ? (
                        <ErrorState
                            title="Failed to load groups"
                            description="The groups list could not be loaded from the server."
                            onRetry={() => void groupsQuery.refetch()}
                        />
                    ) : !groupsQuery.data || groupsQuery.data.items.length === 0 ? (
                        <EmptyState
                            title="No groups found"
                            description="Create the first academic group to start working with the directory module."
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create first group
                                </Button>
                            }
                        />
                    ) : (
                        <Stack spacing={0} sx={{ p: 2 }}>
                            <Box sx={{ px: 1, pb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total records: {groupsQuery.data.totalCount}
                                </Typography>
                            </Box>

                            <EntityTable
                                columns={
                                    <>
                                        <EntityTableHeaderCell>Name</EntityTableHeaderCell>
                                        <EntityTableHeaderCell>Code</EntityTableHeaderCell>
                                        <EntityTableHeaderCell>Status</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="right">
                                            Actions
                                        </EntityTableHeaderCell>
                                    </>
                                }
                            >
                                {groupsQuery.data.items.map((group) => {
                                    const isTogglingCurrent =
                                        toggleMutation.isPending &&
                                        toggleMutation.variables?.id === group.id;

                                    return (
                                        <EntityRow key={group.id}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: '1fr',
                                                        md: 'minmax(280px, 2fr) 160px 140px 140px',
                                                    },
                                                    alignItems: 'center',
                                                    columnGap: 2,
                                                    rowGap: 1.5,
                                                }}
                                            >
                                                <Stack spacing={0.35} minWidth={0}>
                                                    <Typography variant="subtitle1" noWrap>
                                                        {group.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Admission year: {group.admissionYear}
                                                    </Typography>
                                                </Stack>

                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: { xs: 'inline', md: 'none' }, mr: 0.75 }}
                                                    >
                                                        Code:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {group.code}
                                                    </Typography>
                                                </Box>

                                                <Box>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: { xs: 'inline', md: 'none' }, mr: 0.75 }}
                                                    >
                                                        Status:
                                                    </Typography>
                                                    <StatusChip
                                                        label={group.isActive ? 'Active' : 'Inactive'}
                                                        variant={group.isActive ? 'success' : 'warning'}
                                                    />
                                                </Box>

                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                                    alignItems="center"
                                                >
                                                    <Tooltip title="Edit group">
                                                        <IconButton onClick={() => setEditingGroup(group)}>
                                                            <EditOutlinedIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip
                                                        title={group.isActive ? 'Deactivate group' : 'Activate group'}
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
                                                </Stack>
                                            </Box>
                                        </EntityRow>
                                    );
                                })}
                            </EntityTable>
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