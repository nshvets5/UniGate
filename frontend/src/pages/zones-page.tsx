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
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useZonesQuery } from '../features/zones/list-zones/use-zones-query';
import { CreateZoneDialog } from '../features/zones/create-zone/create-zone-dialog';
import { useToggleZoneActiveMutation } from '../features/zones/toggle-zone-active/use-toggle-zone-active-mutation';
import { UpdateZoneDialog } from '../features/zones/update-zone/update-zone-dialog';
import type { ZoneDto } from '../entities/zone/types';
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

export function ZonesPage() {
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<ZoneDto | null>(null);

    const desktopColumns = 'minmax(280px, 2fr) 170px 150px 150px';

    const queryParams = useMemo(
        () => ({
            search: search || undefined,
            page: 1,
            pageSize: 20,
        }),
        [search]
    );

    const zonesQuery = useZonesQuery(queryParams);
    const toggleMutation = useToggleZoneActiveMutation();

    const handleToggleActive = async (zone: ZoneDto) => {
        await toggleMutation.mutateAsync({
            id: zone.id,
            isActive: !zone.isActive,
        });
    };

    return (
        <PageContainer>
            <PageHeader
                title="Zones"
                subtitle="Manage physical access zones and lifecycle state."
            />

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Stack spacing={0}>
                    <Stack sx={{ p: 3 }}>
                        <EntityToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Search zones by code or name..."
                            primaryAction={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create zone
                                </Button>
                            }
                        />
                    </Stack>

                    <Divider />

                    {zonesQuery.isLoading ? (
                        <LoadingState
                            title="Loading zones"
                            description="Please wait while access zones are being loaded."
                        />
                    ) : zonesQuery.isError ? (
                        <ErrorState
                            title="Failed to load zones"
                            description="The zones list could not be loaded from the server."
                            onRetry={() => void zonesQuery.refetch()}
                        />
                    ) : !zonesQuery.data || zonesQuery.data.items.length === 0 ? (
                        <EmptyState
                            title="No zones found"
                            description="Create the first zone to start structuring the access domain."
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create first zone
                                </Button>
                            }
                        />
                    ) : (
                        <Stack spacing={0} sx={{ p: 2.25 }}>
                            <Box sx={{ px: 1, pb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total records: {zonesQuery.data.totalCount}
                                </Typography>
                            </Box>

                            <EntityTable
                                gridTemplateColumns={desktopColumns}
                                columns={
                                    <>
                                        <EntityTableHeaderCell>Name</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="center">Code</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="center">Status</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="right">Actions</EntityTableHeaderCell>
                                    </>
                                }
                            >
                                {zonesQuery.data.items.map((zone) => {
                                    const isTogglingCurrent =
                                        toggleMutation.isPending &&
                                        toggleMutation.variables?.id === zone.id;

                                    const accentColor = zone.isActive
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main;

                                    return (
                                        <EntityRow key={zone.id} accentColor={accentColor}>
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
                                                <Stack spacing={0.45} minWidth={0}>
                                                    <Typography variant="subtitle1" noWrap>
                                                        {zone.name}
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                        {zone.description || 'No description provided'}
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
                                                    <CodeBadge value={zone.code} />
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
                                                        label={zone.isActive ? 'Active' : 'Inactive'}
                                                        variant={zone.isActive ? 'success' : 'warning'}
                                                    />
                                                </Box>

                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                                    alignItems="center"
                                                >
                                                    <RowActions>
                                                        <Tooltip title="Edit zone">
                                                            <IconButton onClick={() => setEditingZone(zone)}>
                                                                <EditOutlinedIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={zone.isActive ? 'Deactivate zone' : 'Activate zone'}
                                                        >
                              <span>
                                <IconButton
                                    onClick={() => void handleToggleActive(zone)}
                                    disabled={isTogglingCurrent}
                                >
                                  {isTogglingCurrent ? (
                                      <CircularProgress size={18} />
                                  ) : zone.isActive ? (
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
                        </Stack>
                    )}
                </Stack>
            </SectionCard>

            <CreateZoneDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
            />

            <UpdateZoneDialog
                open={Boolean(editingZone)}
                zone={editingZone}
                onClose={() => setEditingZone(null)}
            />
        </PageContainer>
    );
}