import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import type { ZoneDto } from '../../entities/zone/types';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';
import { ZoneDoorsSection } from './zone-doors-section';
import { ZoneRulesSection } from './zone-rules-section';

type Props = {
    zone: ZoneDto | null;
    onEdit: (zone: ZoneDto) => void;
    onToggleActive: (zone: ZoneDto) => void;
    isTogglePending: boolean;
};

export function ZoneDetailsPanel({
                                     zone,
                                     onEdit,
                                     onToggleActive,
                                     isTogglePending,
                                 }: Props) {
    const theme = useTheme();
    const [tab, setTab] = useState<'overview' | 'doors' | 'rules'>('overview');

    if (!zone) {
        return (
            <SectionCard>
                <EmptyState
                    title="No zone selected"
                    description="Select a zone from the access tree to manage its doors and access policies."
                />
            </SectionCard>
        );
    }

    return (
        <Stack spacing={3}>
            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        gap={2}
                    >
                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <CodeBadge value={zone.code} />
                                <StatusChip
                                    label={zone.isActive ? 'Active' : 'Inactive'}
                                    variant={zone.isActive ? 'success' : 'warning'}
                                />
                            </Stack>

                            <Stack spacing={0.5}>
                                <Typography variant="h5" fontWeight={800}>
                                    {zone.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Selected access zone workspace.
                                </Typography>
                            </Stack>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button
                                variant="outlined"
                                startIcon={<EditOutlinedIcon />}
                                onClick={() => onEdit(zone)}
                            >
                                Edit zone
                            </Button>

                            <Button
                                variant="outlined"
                                color={zone.isActive ? 'warning' : 'success'}
                                startIcon={
                                    isTogglePending ? (
                                        <CircularProgress size={16} />
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
                </Box>

                <Divider />

                <Tabs
                    value={tab}
                    onChange={(_, value) => setTab(value)}
                    sx={{
                        px: 2,
                        minHeight: 52,
                        '& .MuiTab-root': {
                            minHeight: 52,
                            textTransform: 'none',
                            fontWeight: 700,
                        },
                    }}
                >
                    <Tab value="overview" label="Overview" />
                    <Tab value="doors" label="Doors" />
                    <Tab value="rules" label="Rules" />
                </Tabs>
            </SectionCard>

            {tab === 'overview' ? (
                <SectionCard>
                    <Stack spacing={2.5}>
                        <Typography variant="subtitle1">Zone overview</Typography>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                                gap: 2,
                            }}
                        >
                            <OverviewMetric label="Zone code" value={zone.code} />
                            <OverviewMetric
                                label="Lifecycle state"
                                value={zone.isActive ? 'Active' : 'Inactive'}
                            />
                            <OverviewMetric
                                label="Created"
                                value={
                                    'createdAt' in zone
                                        ? new Date(zone.createdAt as string).toLocaleDateString()
                                        : '—'
                                }
                            />
                        </Box>

                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: alpha(theme.palette.primary.main, 0.035),
                            }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Use the tabs above to manage physical doors and access policies
                                assigned to this zone. This layout keeps the zone workspace focused
                                while still keeping all related infrastructure in one place.
                            </Typography>
                        </Box>
                    </Stack>
                </SectionCard>
            ) : null}

            {tab === 'doors' ? <ZoneDoorsSection zone={zone} /> : null}

            {tab === 'rules' ? <ZoneRulesSection zone={zone} /> : null}
        </Stack>
    );
}

function OverviewMetric({ label, value }: { label: string; value: string }) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.75 }} noWrap>
                {value}
            </Typography>
        </Box>
    );
}