import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import {
    Box,
    Button,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReaderAttemptsQuery } from '../features/readers/reader-details/use-reader-attempts-query';
import { useReaderQuery } from '../features/readers/reader-details/use-reader-query';
import { useReaderStatusQuery } from '../features/readers/reader-details/use-reader-status-query';
import { CodeBadge } from '../shared/ui/code-badge';
import { EmptyState } from '../shared/ui/empty-state';
import { EntityRow } from '../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../shared/ui/entity-table';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

const readerTypeLabels: Record<number, string> = {
    1: 'RFID',
    2: 'QR',
    3: 'Mixed',
    4: 'Emulator',
};

function formatDateTime(value?: string | null) {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
}

export function ReaderDetailsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id = '' } = useParams();

    const readerQuery = useReaderQuery(id);
    const statusQuery = useReaderStatusQuery(id);
    const attemptsQuery = useReaderAttemptsQuery(id, {
        page: 1,
        pageSize: 10,
    });

    const reader = statusQuery.data ?? readerQuery.data;

    const counters = useMemo(() => {
        const attempts = attemptsQuery.data?.items ?? [];

        return {
            total: attempts.length,
            allowed: attempts.filter((attempt) => attempt.isAllowed).length,
            denied: attempts.filter((attempt) => !attempt.isAllowed).length,
        };
    }, [attemptsQuery.data]);

    const attemptsColumns = '190px 170px 1fr 140px';

    if (readerQuery.isLoading) {
        return (
            <PageContainer>
                <LoadingState
                    title="Loading reader"
                    description="Please wait while reader details are being loaded."
                />
            </PageContainer>
        );
    }

    if (readerQuery.isError || !reader) {
        return (
            <PageContainer>
                <ErrorState
                    title="Failed to load reader"
                    description="Reader details could not be loaded from the server."
                    onRetry={() => void readerQuery.refetch()}
                />
            </PageContainer>
        );
    }

    const online = 'isOnline' in reader ? reader.isOnline : false;

    return (
        <PageContainer>
            <PageHeader
                title={reader.name}
                subtitle="Reader device status, heartbeat and recent scan decisions."
                actions={
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackOutlinedIcon />}
                        onClick={() => navigate('/admin/readers')}
                    >
                        Back
                    </Button>
                }
            />

            <SectionCard>
                <Stack spacing={2.5}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        gap={2}
                    >
                        <Stack spacing={1.25}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: 3.5,
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: online
                                        ? alpha(theme.palette.success.main, 0.12)
                                        : alpha(theme.palette.warning.main, 0.12),
                                    color: online ? 'success.main' : 'warning.main',
                                }}
                            >
                                {online ? <WifiOutlinedIcon /> : <WifiOffOutlinedIcon />}
                            </Box>

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                <CodeBadge value={reader.code} />
                                <StatusChip
                                    label={online ? 'Online' : 'Offline'}
                                    variant={online ? 'success' : 'warning'}
                                />
                                <StatusChip
                                    label={reader.isActive ? 'Active' : 'Inactive'}
                                    variant={reader.isActive ? 'success' : 'warning'}
                                />
                            </Stack>
                        </Stack>

                        <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                            <Chip
                                icon={<SensorsOutlinedIcon />}
                                label={readerTypeLabels[reader.type] ?? `Type ${reader.type}`}
                                variant="outlined"
                            />
                            <Typography variant="body2" color="text.secondary">
                                Last heartbeat: {formatDateTime(reader.lastSeenAt)}
                            </Typography>
                            {'utcNow' in reader ? (
                                <Typography variant="body2" color="text.secondary">
                                    Server time: {formatDateTime(reader.utcNow)}
                                </Typography>
                            ) : null}
                        </Stack>
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            Door ID
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {reader.doorId}
                        </Typography>
                    </Stack>
                </Stack>
            </SectionCard>

            <Grid container spacing={2}>
                {[
                    ['Recent attempts', counters.total],
                    ['Allowed', counters.allowed],
                    ['Denied', counters.denied],
                ].map(([label, value]) => (
                    <Grid key={label} size={{ xs: 12, md: 4 }}>
                        <SectionCard>
                            <Typography variant="body2" color="text.secondary">
                                {label}
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1 }}>
                                {value}
                            </Typography>
                        </SectionCard>
                    </Grid>
                ))}
            </Grid>

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1">Recent scan attempts</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Latest access decisions captured by this reader.
                    </Typography>
                </Box>

                <Divider />

                {attemptsQuery.isLoading ? (
                    <LoadingState
                        title="Loading attempts"
                        description="Please wait while scan attempts are being loaded."
                    />
                ) : attemptsQuery.isError ? (
                    <ErrorState
                        title="Failed to load attempts"
                        description="Reader scan attempts could not be loaded."
                        onRetry={() => void attemptsQuery.refetch()}
                    />
                ) : !attemptsQuery.data || attemptsQuery.data.items.length === 0 ? (
                    <EmptyState
                        title="No attempts found"
                        description="This reader has not recorded any scan attempts yet."
                    />
                ) : (
                    <Stack spacing={0} sx={{ p: 2.25 }}>
                        <EntityTable
                            gridTemplateColumns={attemptsColumns}
                            columns={
                                <>
                                    <EntityTableHeaderCell>Time</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="center">
                                        Credential
                                    </EntityTableHeaderCell>
                                    <EntityTableHeaderCell>Decision</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="right">
                                        Result
                                    </EntityTableHeaderCell>
                                </>
                            }
                        >
                            {attemptsQuery.data.items.map((attempt) => (
                                <EntityRow
                                    key={attempt.id}
                                    accentColor={
                                        attempt.isAllowed
                                            ? theme.palette.success.main
                                            : theme.palette.error.main
                                    }
                                >
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: '1fr',
                                                md: attemptsColumns,
                                            },
                                            alignItems: 'center',
                                            columnGap: 2,
                                            rowGap: 1.5,
                                            pl: { xs: 0, md: 1.25 },
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {formatDateTime(attempt.occurredAt)}
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: { xs: 'flex-start', md: 'center' },
                                            }}
                                        >
                                            <CodeBadge value={attempt.credentialType.toUpperCase()} />
                                        </Box>

                                        <Stack spacing={0.35} minWidth={0}>
                                            <Typography variant="subtitle2">
                                                {attempt.reasonCode}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {attempt.credentialValue}
                                            </Typography>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                        >
                                            <StatusChip
                                                label={attempt.isAllowed ? 'Allowed' : 'Denied'}
                                                variant={attempt.isAllowed ? 'success' : 'error'}
                                            />
                                        </Stack>
                                    </Box>
                                </EntityRow>
                            ))}
                        </EntityTable>
                    </Stack>
                )}
            </SectionCard>
        </PageContainer>
    );
}