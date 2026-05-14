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

        const selectedStillExists = zones.some((zone) => zone.id === selectedZoneId);

        if (!selectedZoneId || !selectedStillExists) {
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
                    subtitle="Manage zones, doors and access rules from a structured workspace."
                />

                <ErrorState
                    title="Failed to load zones"
                    description="The access workspace could not be loaded from the server."
                    onRetry={() => void zonesQuery.refetch()}
                />
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Access workspace"
                subtitle="Structured view for zones, physical entry points and access policies."
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        xl: '380px minmax(0, 1fr)',
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
                    onEdit={(zone) => setEditingZone(zone)}
                    onToggleActive={(zone) => void handleToggleActive(zone)}
                    isTogglePending={
                        toggleMutation.isPending &&
                        toggleMutation.variables?.id === selectedZone?.id
                    }
                />
            </Box>

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