import { Box } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { ZoneDto } from '../entities/zone/types';
import { CreateZoneDialog } from '../features/zones/create-zone/create-zone-dialog';
import { useZonesQuery } from '../features/zones/list-zones/use-zones-query';
import { useToggleZoneActiveMutation } from '../features/zones/toggle-zone-active/use-toggle-zone-active-mutation';
import { UpdateZoneDialog } from '../features/zones/update-zone/update-zone-dialog';
import { ErrorState } from '../shared/ui/error-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { ZoneAccessTreePanel } from '../widgets/zones/zone-access-tree-panel';
import { ZoneDetailsPanel } from '../widgets/zones/zone-details-panel';

export function ZonesPage() {
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<ZoneDto | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

    const queryParams = useMemo(
        () => ({
            search: search || undefined,
            page: 1,
            pageSize: 50,
        }),
        [search]
    );

    const zonesQuery = useZonesQuery(queryParams);
    const toggleMutation = useToggleZoneActiveMutation();

    const zones = zonesQuery.data?.items ?? [];

    useEffect(() => {
        if (zones.length === 0) {
            setSelectedZoneId(null);
            return;
        }

        if (!selectedZoneId || !zones.some((zone) => zone.id === selectedZoneId)) {
            setSelectedZoneId(zones[0].id);
        }
    }, [zones, selectedZoneId]);

    const selectedZone = zones.find((zone) => zone.id === selectedZoneId) ?? null;

    const handleToggleActive = async (zone: ZoneDto) => {
        await toggleMutation.mutateAsync({
            id: zone.id,
            isActive: !zone.isActive,
        });
    };

    if (zonesQuery.isError) {
        return (
            <PageContainer>
                <PageHeader
                    title="Access workspace"
                    subtitle="Manage zones, rooms, doors and target-based access policies."
                />

                <ErrorState
                    title="Failed to load access workspace"
                    description="Zones could not be loaded from the server."
                    onRetry={() => void zonesQuery.refetch()}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Access workspace"
                subtitle="Hierarchical control of zones, rooms, doors and access rule targets."
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        xl: '410px minmax(0, 1fr)',
                    },
                    gap: 3,
                    alignItems: 'start',
                }}
            >
                <ZoneAccessTreePanel
                    zones={zones}
                    selectedZoneId={selectedZoneId}
                    search={search}
                    isLoading={zonesQuery.isLoading}
                    onSearchChange={setSearch}
                    onCreateClick={() => setCreateOpen(true)}
                    onSelectZone={(zone) => setSelectedZoneId(zone.id)}
                />

                <ZoneDetailsPanel
                    zone={selectedZone}
                    zones={zones}
                    onEdit={(zone) => setEditingZone(zone)}
                    onToggleActive={(zone) => void handleToggleActive(zone)}
                    isTogglePending={
                        toggleMutation.isPending &&
                        toggleMutation.variables?.id === selectedZone?.id
                    }
                />
            </Box>

            <CreateZoneDialog open={createOpen} onClose={() => setCreateOpen(false)} />

            <UpdateZoneDialog
                open={Boolean(editingZone)}
                zone={editingZone}
                onClose={() => setEditingZone(null)}
            />
        </PageContainer>
    );
}