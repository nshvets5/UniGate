import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import type { ZoneDto } from '../../entities/zone/types';
import { EmptyState } from '../../shared/ui/empty-state';
import { EntityToolbar } from '../../shared/ui/entity-toolbar';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import { ZoneListItem } from './zone-list-item';

type ZoneListPanelProps = {
    zones: ZoneDto[];
    selectedZoneId: string | null;
    search: string;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
    onSelectZone: (zone: ZoneDto) => void;
    isLoading?: boolean;
};

export function ZoneListPanel({
                                  zones,
                                  selectedZoneId,
                                  search,
                                  onSearchChange,
                                  onCreateClick,
                                  onSelectZone,
                                  isLoading = false,
                              }: ZoneListPanelProps) {
    return (
        <SectionCard
            sx={{
                p: 0,
                height: '100%',
                minHeight: 640,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            <Box sx={{ p: 2.5 }}>
                <EntityToolbar
                    searchValue={search}
                    onSearchChange={onSearchChange}
                    searchPlaceholder="Search zones..."
                    primaryAction={
                        <Button
                            variant="contained"
                            startIcon={<AddOutlinedIcon />}
                            onClick={onCreateClick}
                        >
                            Create
                        </Button>
                    }
                />
            </Box>

            <Divider />

            <Box
                sx={{
                    flex: 1,
                    overflow: 'auto',
                    p: 1.5,
                }}
            >
                {isLoading ? (
                    <LoadingState
                        title="Loading zones"
                        description="Please wait while access zones are being loaded."
                    />
                ) : zones.length === 0 ? (
                    <EmptyState
                        title="No zones found"
                        description="Create the first zone to start structuring the access domain."
                        action={
                            <Button
                                variant="contained"
                                startIcon={<AddOutlinedIcon />}
                                onClick={onCreateClick}
                            >
                                Create zone
                            </Button>
                        }
                    />
                ) : (
                    <Stack spacing={1}>
                        {zones.map((zone) => (
                            <ZoneListItem
                                key={zone.id}
                                zone={zone}
                                selected={selectedZoneId === zone.id}
                                onClick={() => onSelectZone(zone)}
                            />
                        ))}
                    </Stack>
                )}
            </Box>
        </SectionCard>
    );
}