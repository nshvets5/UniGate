import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TimetableBatchDto } from '../entities/timetable/api';
import { useActivateTimetableBatchMutation } from '../features/timetable/activate-batch/use-activate-timetable-batch-mutation';
import { useTimetableBatchesQuery } from '../features/timetable/list-batches/use-timetable-batches-query';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function getBatchVariant(
    batch: TimetableBatchDto
): 'success' | 'warning' | 'error' | 'info' | 'default' {
    if (batch.isActive) return 'success';

    const status = batch.status.toLowerCase();

    if (status.includes('failed') || status.includes('error')) return 'error';
    if (status.includes('partial')) return 'warning';
    if (status.includes('completed') || status.includes('imported')) return 'info';

    return 'default';
}

export function TimetableBatchesPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    const batchesQuery = useTimetableBatchesQuery({
        page: 1,
        pageSize: 50,
    });

    const activateMutation = useActivateTimetableBatchMutation();

    const batches = batchesQuery.data?.items ?? [];

    const stats = useMemo(() => {
        const active = batches.find((batch) => batch.isActive);

        return {
            total: batches.length,
            activeBatch: active?.fileName ?? active?.id ?? '—',
            importedRows: active?.importedRows ?? 0,
            skippedRows: active?.skippedRows ?? 0,
        };
    }, [batches]);

    const handleActivate = async (batch: TimetableBatchDto) => {
        await activateMutation.mutateAsync(batch.id);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Timetable batches"
                subtitle="Review import snapshots, active timetable state and rollback points."
                actions={
                    <Button
                        variant="contained"
                        startIcon={<UploadFileOutlinedIcon />}
                        onClick={() => navigate('/admin/timetable/import')}
                    >
                        Import timetable
                    </Button>
                }
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                    gap: 2,
                }}
            >
                {[
                    ['Total batches', stats.total],
                    ['Active batch', stats.activeBatch],
                    ['Imported rows', stats.importedRows],
                    ['Skipped rows', stats.skippedRows],
                ].map(([label, value]) => (
                    <SectionCard key={label}>
                        <Typography variant="body2" color="text.secondary">
                            {label}
                        </Typography>

                        <Typography
                            variant={typeof value === 'number' ? 'h4' : 'h6'}
                            sx={{ mt: 1, wordBreak: 'break-word' }}
                        >
                            {value}
                        </Typography>
                    </SectionCard>
                ))}
            </Box>

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 3,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                            }}
                        >
                            <HistoryOutlinedIcon />
                        </Box>

                        <Stack>
                            <Typography variant="subtitle1">Import timeline</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Each batch represents an immutable timetable snapshot. Activate a previous batch to roll back.
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>

                <Divider />

                {batchesQuery.isLoading ? (
                    <LoadingState
                        title="Loading timetable batches"
                        description="Please wait while import history is being loaded."
                    />
                ) : batchesQuery.isError ? (
                    <ErrorState
                        title="Failed to load timetable batches"
                        description="Timetable import history could not be loaded from the server."
                        onRetry={() => void batchesQuery.refetch()}
                    />
                ) : batches.length === 0 ? (
                    <EmptyState
                        title="No timetable batches found"
                        description="Import a timetable file to create the first batch snapshot."
                        action={
                            <Button
                                variant="contained"
                                startIcon={<UploadFileOutlinedIcon />}
                                onClick={() => navigate('/admin/timetable/import')}
                            >
                                Import timetable
                            </Button>
                        }
                    />
                ) : (
                    <Stack spacing={0} divider={<Divider />}>
                        {batches.map((batch) => {
                            const isActivatingCurrent =
                                activateMutation.isPending &&
                                activateMutation.variables === batch.id;

                            return (
                                <Box
                                    key={batch.id}
                                    sx={{
                                        p: 3,
                                        display: 'grid',
                                        gridTemplateColumns: {
                                            xs: '1fr',
                                            lg: '52px minmax(0, 1fr) 190px 180px',
                                        },
                                        gap: 2,
                                        alignItems: 'center',
                                        bgcolor: batch.isActive
                                            ? alpha(theme.palette.success.main, 0.045)
                                            : 'transparent',
                                        transition: 'background-color 0.18s ease',
                                        '&:hover': {
                                            bgcolor: batch.isActive
                                                ? alpha(theme.palette.success.main, 0.075)
                                                : alpha(theme.palette.primary.main, 0.03),
                                        },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 46,
                                            height: 46,
                                            borderRadius: 3,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: batch.isActive
                                                ? alpha(theme.palette.success.main, 0.14)
                                                : alpha(theme.palette.primary.main, 0.1),
                                            color: batch.isActive ? 'success.main' : 'primary.main',
                                        }}
                                    >
                                        {batch.isActive ? (
                                            <CheckCircleOutlineOutlinedIcon />
                                        ) : (
                                            <CalendarMonthOutlinedIcon />
                                        )}
                                    </Box>

                                    <Stack spacing={1} minWidth={0}>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <StatusChip
                                                label={batch.isActive ? 'Active' : batch.status}
                                                variant={getBatchVariant(batch)}
                                            />
                                            <StatusChip label={batch.source} variant="default" />
                                        </Stack>

                                        <Typography variant="subtitle1" noWrap>
                                            {batch.fileName ?? batch.id}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" noWrap>
                                            Created: {formatDateTime(batch.createdAt)}
                                        </Typography>

                                        {batch.activatedAt ? (
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                Activated: {formatDateTime(batch.activatedAt)}
                                            </Typography>
                                        ) : null}
                                    </Stack>

                                    <Stack spacing={0.75}>
                                        <Typography variant="body2" color="text.secondary">
                                            Import result
                                        </Typography>

                                        <Typography variant="h6">
                                            {batch.importedRows}/{batch.totalRows}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            skipped {batch.skippedRows}
                                        </Typography>
                                    </Stack>

                                    <Stack
                                        direction="row"
                                        justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
                                    >
                                        <Button
                                            variant={batch.isActive ? 'contained' : 'outlined'}
                                            color={batch.isActive ? 'success' : 'primary'}
                                            startIcon={
                                                isActivatingCurrent ? (
                                                    <CircularProgress size={16} />
                                                ) : batch.isActive ? (
                                                    <CheckCircleOutlineOutlinedIcon />
                                                ) : (
                                                    <RestoreOutlinedIcon />
                                                )
                                            }
                                            onClick={() => void handleActivate(batch)}
                                            disabled={batch.isActive || isActivatingCurrent}
                                        >
                                            {batch.isActive ? 'Current' : 'Activate'}
                                        </Button>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </SectionCard>
        </PageContainer>
    );
}