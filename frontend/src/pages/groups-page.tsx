import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateGroupDialog } from '../features/groups/create-group/create-group-dialog';
import { useGroupsQuery } from '../features/groups/list-groups/use-groups-query';
import { EmptyState } from '../shared/ui/empty-state';
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

    const queryParams = useMemo(
        () => ({
            search: search || undefined,
            page: 1,
            pageSize: 20,
        }),
        [search]
    );

    const groupsQuery = useGroupsQuery(queryParams);

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
                        <Stack spacing={0}>
                            <Box sx={{ px: 3, py: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total records: {groupsQuery.data.totalCount}
                                </Typography>
                            </Box>

                            <Divider />

                            <Stack divider={<Divider />}>
                                {groupsQuery.data.items.map((group) => (
                                    <Box
                                        key={group.id}
                                        sx={{
                                            px: 3,
                                            py: 2.25,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Stack spacing={0.5}>
                                            <Typography variant="subtitle1">{group.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {group.code} · Admission year: {group.admissionYear}
                                            </Typography>
                                        </Stack>

                                        <StatusChip
                                            label={group.isActive ? 'Active' : 'Inactive'}
                                            variant={group.isActive ? 'success' : 'warning'}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </SectionCard>

            <CreateGroupDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />
        </PageContainer>
    );
}