import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ZoneDto } from '../../entities/zone/types';
import { CodeBadge } from '../../shared/ui/code-badge';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';
import { ZoneSummaryCards } from './zone-summary-cards';

type ZoneDetailsPanelProps = {
    zone: ZoneDto | null;
    onEdit: (zone: ZoneDto) => void;
    onToggleActive: (zone: ZoneDto) => void;
    isTogglePending?: boolean;
};

export function ZoneDetailsPanel({
                                     zone,
                                     onEdit,
                                     onToggleActive,
                                     isTogglePending = false,
                                 }: ZoneDetailsPanelProps) {
    const theme = useTheme();

    if (!zone) {
        return (
            <SectionCard
                sx={{
                    minHeight: 640,
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <Stack spacing={1.5} alignItems="center" textAlign="center">
                    <Typography variant="h6">Select a zone</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                        Choose a zone from the left panel to inspect its details, lifecycle state and related infrastructure.
                    </Typography>
                </Stack>
            </SectionCard>
        );
    }

    return (
        <Stack spacing={2.5}>
            <SectionCard>
                <Stack spacing={2.5}>
                    <Stack
                        direction={{ xs: 'column', lg: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', lg: 'flex-start' }}
                        gap={2}
                    >
                        <Stack spacing={1.25}>
                            <Typography variant="h5">{zone.name}</Typography>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <CodeBadge value={zone.code} />
                                <StatusChip
                                    label={zone.isActive ? 'Active' : 'Inactive'}
                                    variant={zone.isActive ? 'success' : 'warning'}
                                />
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760 }}>
                                {zone.description || 'No description provided for this zone.'}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                startIcon={<EditOutlinedIcon />}
                                onClick={() => onEdit(zone)}
                            >
                                Edit
                            </Button>

                            <Button
                                variant="outlined"
                                color={zone.isActive ? 'warning' : 'success'}
                                startIcon={
                                    isTogglePending ? (
                                        <CircularProgress size={18} />
                                    ) : zone.isActive ? (
                                        <PauseCircleOutlineOutlinedIcon />
                                    ) : (
                                        <PlayCircleOutlineOutlinedIcon />
                                    )
                                }
                                onClick={() => onToggleActive(zone)}
                                disabled={isTogglePending}
                            >
                                {zone.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                        </Stack>
                    </Stack>

                    <Divider />

                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        useFlexGap
                        flexWrap="wrap"
                    >
                        <Typography variant="body2" color="text.secondary">
                            Created: {new Date(zone.createdAt).toLocaleString()}
                        </Typography>

                        <Box
                            sx={{
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: alpha(theme.palette.text.secondary, 0.5),
                                display: { xs: 'none', md: 'block' },
                                alignSelf: 'center',
                            }}
                        />

                        <Typography variant="body2" color="text.secondary">
                            Workspace view for access infrastructure
                        </Typography>
                    </Stack>
                </Stack>
            </SectionCard>

            <ZoneSummaryCards />

            <SectionCard>
                <Stack spacing={1}>
                    <Typography variant="subtitle1">Zone workspace</Typography>
                    <Typography variant="body2" color="text.secondary">
                        This panel will host embedded sections for doors, readers and access rules related to the selected zone.
                    </Typography>
                </Stack>
            </SectionCard>
        </Stack>
    );
}