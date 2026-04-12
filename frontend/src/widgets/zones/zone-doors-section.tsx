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
import type { ZoneDto } from '../../entities/zone/types';
import type { DoorDto } from '../../entities/door/types';
import { useDoorsQuery } from '../../features/doors/list-doors/use-doors-query';
import { CreateDoorDialog } from '../../features/doors/create-door/create-door-dialog';
import { useToggleDoorActiveMutation } from '../../features/doors/toggle-door-active/use-toggle-door-active-mutation';
import { UpdateDoorDialog } from '../../features/doors/update-door/update-door-dialog';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { EntityRow } from '../../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../../shared/ui/entity-table';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { RowActions } from '../../shared/ui/row-actions';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type ZoneDoorsSectionProps = {
    zone: ZoneDto;
};

export function ZoneDoorsSection({ zone }: ZoneDoorsSectionProps) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingDoor, setEditingDoor] = useState<DoorDto | null>(null);

    const desktopColumns = 'minmax(220px, 1.8fr) 140px 140px 150px';

    const queryParams = useMemo(
        () => ({
            zoneId: zone.id,
            page: 1,
            pageSize: 20,
        }),
        [zone.id]
    );

    const doorsQuery = useDoorsQuery(queryParams);
    const toggleMutation = useToggleDoorActiveMutation();

    const handleToggleActive = async (door: DoorDto) => {
        await toggleMutation.mutateAsync({
            id: door.id,
            isActive: !door.isActive,
        });
    };

    return (
        <>
            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Stack spacing={0}>
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
                            <Typography variant="subtitle1">Doors in this zone</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Manage physical doors assigned to the selected access zone.
                            </Typography>
                        </Stack>

                        <Button
                            variant="contained"
                            startIcon={<AddOutlinedIcon />}
                            onClick={() => setCreateOpen(true)}
                        >
                            Add door
                        </Button>
                    </Box>

                    <Divider />

                    {doorsQuery.isLoading ? (
                        <LoadingState
                            title="Loading doors"
                            description="Please wait while zone doors are being loaded."
                        />
                    ) : doorsQuery.isError ? (
                        <ErrorState
                            title="Failed to load doors"
                            description="The doors list could not be loaded from the server."
                            onRetry={() => void doorsQuery.refetch()}
                        />
                    ) : !doorsQuery.data || doorsQuery.data.items.length === 0 ? (
                        <EmptyState
                            title="No doors found"
                            description="Add the first door to connect physical entry points with this zone."
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Add first door
                                </Button>
                            }
                        />
                    ) : (
                        <Stack spacing={0} sx={{ p: 2.25 }}>
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
                                {doorsQuery.data.items.map((door) => {
                                    const isTogglingCurrent =
                                        toggleMutation.isPending &&
                                        toggleMutation.variables?.id === door.id;

                                    return (
                                        <EntityRow key={door.id}>
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
                                                        {door.name}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" noWrap>
                                                        {door.description || 'No description provided'}
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
                                                    <CodeBadge value={door.code} />
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
                                                        label={door.isActive ? 'Active' : 'Inactive'}
                                                        variant={door.isActive ? 'success' : 'warning'}
                                                    />
                                                </Box>

                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                                    alignItems="center"
                                                >
                                                    <RowActions>
                                                        <Tooltip title="Edit door">
                                                            <IconButton onClick={() => setEditingDoor(door)}>
                                                                <EditOutlinedIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={door.isActive ? 'Deactivate door' : 'Activate door'}
                                                        >
                              <span>
                                <IconButton
                                    onClick={() => void handleToggleActive(door)}
                                    disabled={isTogglingCurrent}
                                >
                                  {isTogglingCurrent ? (
                                      <CircularProgress size={18} />
                                  ) : door.isActive ? (
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

            <CreateDoorDialog
                open={createOpen}
                zoneId={zone.id}
                onClose={() => setCreateOpen(false)}
            />

            <UpdateDoorDialog
                open={Boolean(editingDoor)}
                door={editingDoor}
                onClose={() => setEditingDoor(null)}
            />
        </>
    );
}