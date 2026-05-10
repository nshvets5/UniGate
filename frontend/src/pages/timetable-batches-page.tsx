import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
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
import type { TimetableBatchDto } from '../entities/timetable/api';
import { useActivateTimetableBatchMutation } from '../features/timetable/activate-batch/use-activate-timetable-batch-mutation';
import { useTimetableBatchesQuery } from '../features/timetable/list-batches/use-timetable-batches-query';
import { EmptyState } from '../shared/ui/empty-state';
import { EntityRow } from '../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../shared/ui/entity-table';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { RowActions } from '../shared/ui/row-actions';
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
    const desktopColumns = 'minmax(280px, 1.8fr) 140px 160px 160px 160px';

    const batchesQuery = useTimetableBatchesQuery({
        page: 1,
        pageSize: 30,
    });

    const activateMutation = useActivateTimetableBatchMutation();

    const batches = batchesQuery.data?.items ?? [];

    const stats = useMemo(() => {
        const active = batches.find((batch) => batch.isActive);

        return {
            total: batches.length,
            activeName: active?.fileName ?? active?.id ?? '—',
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
                subtitle="Review import history, active timetable state and rollback points."
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
                    ['Active batch', stats.activeName],
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
                                width: 42,
                                height: 42,
                                borderRadius: 2.5,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                            }}
                        >
                            <HistoryOutlinedIcon />
                        </Box>

                        <Stack>
                            <Typography variant="subtitle1">Import history</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Batches can be activated to roll back or switch the active timetable snapshot.
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
                    />
                ) : (
                    <Stack spacing={0} sx={{ p: 2.25 }}>
                        <EntityTable
                            gridTemplateColumns={desktopColumns}
                            columns={
                                <>
                                    <EntityTableHeaderCell>Batch</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="center">Source</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="center">Rows</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="center">Status</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="right">Actions</EntityTableHeaderCell>
                                </>
                            }
                        >
                            {batches.map((batch) => {
                                const isActivatingCurrent =
                                    activateMutation.isPending &&
                                    activateMutation.variables === batch.id;

                                return (
                                    <EntityRow
                                        key={batch.id}
                                        accentColor={
                                            batch.isActive
                                                ? theme.palette.success.main
                                                : theme.palette.divider
                                        }
                                    >
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
                                                    {batch.fileName ?? batch.id}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    Created {formatDateTime(batch.createdAt)}
                                                </Typography>
                                            </Stack>

                                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>
                                                <StatusChip label={batch.source} variant="default" />
                                            </Box>

                                            <Stack alignItems={{ xs: 'flex-start', md: 'center' }} spacing={0.25}>
                                                <Typography variant="body2">
                                                    {batch.importedRows}/{batch.totalRows}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    skipped {batch.skippedRows}
                                                </Typography>
                                            </Stack>

                                            <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'center' } }}>
                                                <StatusChip
                                                    label={batch.isActive ? 'Active' : batch.status}
                                                    variant={getBatchVariant(batch)}
                                                />
                                            </Box>

                                            <Stack
                                                direction="row"
                                                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                            >
                                                <RowActions>
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={
                                                            isActivatingCurrent ? (
                                                                <CircularProgress size={16} />
                                                            ) : (
                                                                <RestoreOutlinedIcon />
                                                            )
                                                        }
                                                        onClick={() => void handleActivate(batch)}
                                                        disabled={batch.isActive || isActivatingCurrent}
                                                    >
                                                        {batch.isActive ? 'Current' : 'Activate'}
                                                    </Button>
                                                </RowActions>
                                            </Stack>
                                        </Box>
                                    </EntityRow>
                                );
                            })}
                        </EntityTable>
                    </Stack>
                )}
            </SectionCard>
        </PageContainer>
    );
}