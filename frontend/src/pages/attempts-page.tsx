import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import PercentOutlinedIcon from '@mui/icons-material/PercentOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    Drawer,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TablePagination,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState, type ReactNode } from 'react';
import type { AttemptDto, GetAttemptsParams } from '../entities/attempt/api';
import { useAttemptsQuery } from '../features/attempts/list-attempts/use-attempts-query';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

type ResultFilter = 'all' | 'allowed' | 'denied';

type FiltersState = {
    result: ResultFilter;
    credentialType: string;
    credentialValue: string;
    fromLocal: string;
    toLocal: string;
};

const defaultFilters: FiltersState = {
    result: 'all',
    credentialType: '',
    credentialValue: '',
    fromLocal: '',
    toLocal: '',
};

export function AttemptsPage() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [filters, setFilters] = useState<FiltersState>(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState<FiltersState>(defaultFilters);
    const [selectedAttempt, setSelectedAttempt] = useState<AttemptDto | null>(null);

    const queryParams = useMemo<GetAttemptsParams>(() => {
        return {
            ...buildAttemptFilters(appliedFilters),
            page: page + 1,
            pageSize,
        };
    }, [appliedFilters, page, pageSize]);

    const attemptsQuery = useAttemptsQuery(queryParams);

    const totalStatsQuery = useAttemptsQuery({
        page: 1,
        pageSize: 1,
    });

    const allowedStatsQuery = useAttemptsQuery({
        isAllowed: true,
        page: 1,
        pageSize: 1,
    });

    const deniedStatsQuery = useAttemptsQuery({
        isAllowed: false,
        page: 1,
        pageSize: 1,
    });

    const attempts = attemptsQuery.data?.items ?? [];
    const filteredTotal = attemptsQuery.data?.totalCount ?? 0;

    const totalCount = totalStatsQuery.data?.totalCount ?? 0;
    const allowedCount = allowedStatsQuery.data?.totalCount ?? 0;
    const deniedCount = deniedStatsQuery.data?.totalCount ?? 0;

    const denyRate =
        allowedCount + deniedCount > 0
            ? Math.round((deniedCount / (allowedCount + deniedCount)) * 100)
            : 0;

    const hasActiveFilters = useMemo(() => {
        return (
            appliedFilters.result !== 'all' ||
            Boolean(appliedFilters.credentialType) ||
            Boolean(appliedFilters.credentialValue) ||
            Boolean(appliedFilters.fromLocal) ||
            Boolean(appliedFilters.toLocal)
        );
    }, [appliedFilters]);

    const handleApplyFilters = () => {
        setPage(0);
        setAppliedFilters(filters);
    };

    const handleResetFilters = () => {
        setPage(0);
        setFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
    };

    const handleRefresh = () => {
        void attemptsQuery.refetch();
        void totalStatsQuery.refetch();
        void allowedStatsQuery.refetch();
        void deniedStatsQuery.refetch();
    };

    return (
        <PageContainer>
            <PageHeader
                title="Access attempts"
                subtitle="Operational console for access decisions, credentials and security events."
                actions={
                    <Button
                        variant="outlined"
                        startIcon={
                            attemptsQuery.isFetching ? (
                                <CircularProgress size={16} />
                            ) : (
                                <RefreshOutlinedIcon />
                            )
                        }
                        onClick={handleRefresh}
                        disabled={attemptsQuery.isFetching}
                    >
                        Refresh
                    </Button>
                }
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, minmax(0, 1fr))',
                        xl: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 2,
                }}
            >
                <AttemptMetric
                    icon={<HistoryOutlinedIcon />}
                    title="Total attempts"
                    value={formatNumber(totalCount)}
                    description="All recorded access decisions."
                    tone="primary"
                    loading={totalStatsQuery.isLoading}
                />

                <AttemptMetric
                    icon={<CheckCircleOutlineOutlinedIcon />}
                    title="Allowed"
                    value={formatNumber(allowedCount)}
                    description="Successful access decisions."
                    tone="success"
                    loading={allowedStatsQuery.isLoading}
                />

                <AttemptMetric
                    icon={<BlockOutlinedIcon />}
                    title="Denied"
                    value={formatNumber(deniedCount)}
                    description="Rejected access attempts."
                    tone={deniedCount > 0 ? 'error' : 'success'}
                    loading={deniedStatsQuery.isLoading}
                />

                <AttemptMetric
                    icon={<PercentOutlinedIcon />}
                    title="Deny rate"
                    value={`${denyRate}%`}
                    description="Denied share among known decisions."
                    tone={denyRate > 20 ? 'error' : denyRate > 5 ? 'warning' : 'success'}
                    loading={allowedStatsQuery.isLoading || deniedStatsQuery.isLoading}
                />
            </Box>

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Stack
                        direction={{ xs: 'column', xl: 'row' }}
                        spacing={2}
                        justifyContent="space-between"
                        alignItems={{ xs: 'stretch', xl: 'center' }}
                    >
                        <Stack spacing={0.5}>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FilterAltOutlinedIcon color="primary" />

                                <Typography variant="subtitle1">
                                    Attempt filters
                                </Typography>

                                {hasActiveFilters ? (
                                    <StatusChip label="Filtered" variant="info" />
                                ) : null}
                            </Stack>

                            <Typography variant="body2" color="text.secondary">
                                Narrow attempts by decision, credential type, credential value and time range.
                            </Typography>
                        </Stack>

                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            spacing={1.25}
                            alignItems={{ xs: 'stretch', md: 'center' }}
                        >
                            <Button
                                variant="contained"
                                onClick={handleApplyFilters}
                                startIcon={<SearchOutlinedIcon />}
                            >
                                Apply
                            </Button>

                            <Button
                                variant="outlined"
                                color="inherit"
                                onClick={handleResetFilters}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Stack>
                </Box>

                <Divider />

                <Box
                    sx={{
                        p: 2.25,
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, minmax(0, 1fr))',
                            xl: '1.1fr 1fr 1.4fr 1fr 1fr',
                        },
                        gap: 1.5,
                    }}
                >
                    <TextField
                        select
                        size="small"
                        label="Decision"
                        value={filters.result}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                result: event.target.value as ResultFilter,
                            }))
                        }
                    >
                        <MenuItem value="all">All decisions</MenuItem>
                        <MenuItem value="allowed">Allowed only</MenuItem>
                        <MenuItem value="denied">Denied only</MenuItem>
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Credential type"
                        value={filters.credentialType}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                credentialType: event.target.value,
                            }))
                        }
                    >
                        <MenuItem value="">All types</MenuItem>
                        <MenuItem value="rfid">RFID</MenuItem>
                        <MenuItem value="qr">QR</MenuItem>
                        <MenuItem value="manual">Manual</MenuItem>
                    </TextField>

                    <TextField
                        size="small"
                        label="Credential value"
                        value={filters.credentialValue}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                credentialValue: event.target.value,
                            }))
                        }
                        placeholder="RFID-000001 / QR-000240"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <KeyOutlinedIcon />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        size="small"
                        label="From"
                        type="datetime-local"
                        value={filters.fromLocal}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                fromLocal: event.target.value,
                            }))
                        }
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        size="small"
                        label="To"
                        type="datetime-local"
                        value={filters.toLocal}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                toLocal: event.target.value,
                            }))
                        }
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            </SectionCard>

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        spacing={1}
                    >
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">
                                Attempts timeline
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Showing {formatNumber(filteredTotal)} matching attempt(s).
                            </Typography>
                        </Stack>

                        {attemptsQuery.isFetching && !attemptsQuery.isLoading ? (
                            <StatusChip label="Updating" variant="info" />
                        ) : null}
                    </Stack>
                </Box>

                <Divider />

                {attemptsQuery.isLoading ? (
                    <LoadingState
                        title="Loading attempts"
                        description="Access decisions are being loaded from the server."
                    />
                ) : attemptsQuery.isError ? (
                    <ErrorState
                        title="Failed to load attempts"
                        description="The access attempt list could not be loaded."
                        onRetry={() => void attemptsQuery.refetch()}
                    />
                ) : attempts.length === 0 ? (
                    <EmptyState
                        title="No attempts found"
                        description="Try changing filters or time range."
                    />
                ) : (
                    <>
                        <Stack divider={<Divider />}>
                            {attempts.map((attempt) => (
                                <AttemptRow
                                    key={attempt.id}
                                    attempt={attempt}
                                    onOpen={() => setSelectedAttempt(attempt)}
                                />
                            ))}
                        </Stack>

                        <Divider />

                        <TablePagination
                            component="div"
                            count={filteredTotal}
                            page={page}
                            rowsPerPage={pageSize}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            onPageChange={(_, nextPage) => setPage(nextPage)}
                            onRowsPerPageChange={(event) => {
                                setPage(0);
                                setPageSize(Number(event.target.value));
                            }}
                        />
                    </>
                )}
            </SectionCard>

            <AttemptDetailsDrawer
                attempt={selectedAttempt}
                onClose={() => setSelectedAttempt(null)}
            />
        </PageContainer>
    );
}

function AttemptRow({
                        attempt,
                        onOpen,
                    }: {
    attempt: AttemptDto;
    onOpen: () => void;
}) {
    const theme = useTheme();

    const color = attempt.isAllowed
        ? theme.palette.success.main
        : theme.palette.error.main;

    return (
        <Box
            component="button"
            type="button"
            onClick={onOpen}
            sx={{
                width: '100%',
                textAlign: 'left',
                border: 0,
                bgcolor: 'transparent',
                cursor: 'pointer',
                p: 0,
                '&:hover .attempt-row-inner': {
                    bgcolor: alpha(color, 0.045),
                },
            }}
        >
            <Box
                className="attempt-row-inner"
                sx={{
                    px: 3,
                    py: 2.25,
                    transition: 'background-color 0.18s ease',
                }}
            >
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            lg: '170px 150px 1.4fr 1fr 1fr 160px',
                        },
                        gap: 2,
                        alignItems: 'center',
                    }}
                >
                    <Stack spacing={0.35}>
                        <Typography variant="subtitle2">
                            {formatTime(attempt.occurredAt)}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            {formatDate(attempt.occurredAt)}
                        </Typography>
                    </Stack>

                    <StatusChip
                        label={attempt.isAllowed ? 'ALLOW' : 'DENY'}
                        variant={attempt.isAllowed ? 'success' : 'error'}
                    />

                    <Stack direction="row" spacing={1.25} alignItems="center" minWidth={0}>
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2.5,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(color, 0.12),
                                color,
                                flexShrink: 0,
                            }}
                        >
                            {attempt.isAllowed ? (
                                <CheckCircleOutlineOutlinedIcon fontSize="small" />
                            ) : (
                                <BlockOutlinedIcon fontSize="small" />
                            )}
                        </Box>

                        <Stack minWidth={0}>
                            <Typography
                                variant="body2"
                                fontWeight={800}
                                noWrap
                                sx={{
                                    fontFamily:
                                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                }}
                            >
                                {attempt.credentialValue}
                            </Typography>

                            <Typography variant="caption" color="text.secondary" noWrap>
                                {attempt.credentialType.toUpperCase()}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack spacing={0.35} minWidth={0}>
                        <Typography variant="caption" color="text.secondary">
                            Reader
                        </Typography>

                        <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace' }}>
                            {shortId(attempt.readerId)}
                        </Typography>
                    </Stack>

                    <Stack spacing={0.35} minWidth={0}>
                        <Typography variant="caption" color="text.secondary">
                            Student
                        </Typography>

                        <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace' }}>
                            {attempt.studentId ? shortId(attempt.studentId) : '—'}
                        </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
                        <StatusChip
                            label={attempt.reasonCode}
                            variant={attempt.isAllowed ? 'success' : 'warning'}
                        />
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}

function AttemptDetailsDrawer({
                                  attempt,
                                  onClose,
                              }: {
    attempt: AttemptDto | null;
    onClose: () => void;
}) {
    return (
        <Drawer
            anchor="right"
            open={Boolean(attempt)}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: {
                        xs: '100%',
                        sm: 520,
                    },
                },
            }}
        >
            {attempt ? (
                <Stack sx={{ height: '100%' }}>
                    <Box sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Stack spacing={0.75}>
                                <Typography variant="h6" fontWeight={800}>
                                    Attempt details
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Full access decision payload.
                                </Typography>
                            </Stack>

                            <Tooltip title="Close">
                                <IconButton onClick={onClose}>
                                    <CloseOutlinedIcon />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Box>

                    <Divider />

                    <Box sx={{ p: 3 }}>
                        <Stack spacing={2.25}>
                            <DecisionCard attempt={attempt} />

                            <DetailSection title="Decision">
                                <DetailRow
                                    label="Result"
                                    value={attempt.isAllowed ? 'ALLOW' : 'DENY'}
                                />
                                <DetailRow label="Reason code" value={attempt.reasonCode} />
                                <DetailRow
                                    label="Meaning"
                                    value={explainReason(attempt.reasonCode)}
                                />
                                <DetailRow
                                    label="Occurred at"
                                    value={formatDateTime(attempt.occurredAt)}
                                />
                            </DetailSection>

                            <DetailSection title="Credential">
                                <DetailRow
                                    label="Type"
                                    value={attempt.credentialType.toUpperCase()}
                                />
                                <DetailRow
                                    label="Value"
                                    value={attempt.credentialValue}
                                    monospace
                                />
                                <DetailRow
                                    label="Credential ID"
                                    value={attempt.credentialId ?? '—'}
                                    monospace
                                />
                            </DetailSection>

                            <DetailSection title="Related entities">
                                <DetailRow
                                    label="Reader ID"
                                    value={attempt.readerId}
                                    monospace
                                />
                                <DetailRow
                                    label="Student ID"
                                    value={attempt.studentId ?? '—'}
                                    monospace
                                />
                                <DetailRow
                                    label="Attempt ID"
                                    value={attempt.id}
                                    monospace
                                />
                            </DetailSection>
                        </Stack>
                    </Box>
                </Stack>
            ) : null}
        </Drawer>
    );
}

function DecisionCard({ attempt }: { attempt: AttemptDto }) {
    const theme = useTheme();

    const color = attempt.isAllowed
        ? theme.palette.success.main
        : theme.palette.error.main;

    return (
        <Box
            sx={{
                p: 2.25,
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha(color, 0.35),
                bgcolor: alpha(color, 0.08),
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(color, 0.14),
                        color,
                    }}
                >
                    <ShieldOutlinedIcon />
                </Box>

                <Stack>
                    <Typography variant="overline" color="text.secondary">
                        Access decision
                    </Typography>

                    <Typography variant="h5" fontWeight={900} sx={{ color }}>
                        {attempt.isAllowed ? 'ALLOWED' : 'DENIED'}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}

function AttemptMetric({
                           icon,
                           title,
                           value,
                           description,
                           tone,
                           loading,
                       }: {
    icon: ReactNode;
    title: string;
    value: string;
    description: string;
    tone: 'primary' | 'success' | 'warning' | 'error';
    loading?: boolean;
}) {
    const theme = useTheme();

    const color =
        tone === 'success'
            ? theme.palette.success.main
            : tone === 'warning'
                ? theme.palette.warning.main
                : tone === 'error'
                    ? theme.palette.error.main
                    : theme.palette.primary.main;

    return (
        <SectionCard>
            <Stack spacing={1.5}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(color, 0.12),
                        color,
                    }}
                >
                    {icon}
                </Box>

                <Stack spacing={0.5}>
                    <Typography variant="body2" color="text.secondary">
                        {title}
                    </Typography>

                    <Typography variant="h5" fontWeight={900}>
                        {loading ? '—' : value}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                        {description}
                    </Typography>
                </Stack>
            </Stack>
        </SectionCard>
    );
}

function DetailSection({
                           title,
                           children,
                       }: {
    title: string;
    children: ReactNode;
}) {
    return (
        <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {title}
            </Typography>

            <Box
                sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    overflow: 'hidden',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

function DetailRow({
                       label,
                       value,
                       monospace,
                   }: {
    label: string;
    value: string;
    monospace?: boolean;
}) {
    return (
        <Box
            sx={{
                px: 1.75,
                py: 1.35,
                display: 'grid',
                gridTemplateColumns: '130px minmax(0, 1fr)',
                gap: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': {
                    borderBottom: 0,
                },
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    wordBreak: 'break-all',
                    fontFamily: monospace
                        ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
                        : undefined,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

function buildAttemptFilters(filters: FiltersState): Omit<GetAttemptsParams, 'page' | 'pageSize'> {
    return {
        isAllowed:
            filters.result === 'allowed'
                ? true
                : filters.result === 'denied'
                    ? false
                    : undefined,
        credentialType: filters.credentialType || undefined,
        credentialValue: filters.credentialValue.trim() || undefined,
        fromUtc: filters.fromLocal ? new Date(filters.fromLocal).toISOString() : undefined,
        toUtc: filters.toLocal ? new Date(filters.toLocal).toISOString() : undefined,
    };
}

function formatNumber(value: number) {
    return new Intl.NumberFormat().format(value);
}

function formatDateTime(value: string) {
    return new Date(value).toLocaleString();
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString();
}

function formatTime(value: string) {
    return new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function shortId(value: string) {
    return value.slice(0, 8);
}

function explainReason(reasonCode: string) {
    const normalized = reasonCode.toUpperCase();

    switch (normalized) {
        case 'ALLOW':
        case 'ALLOWED':
            return 'Access was granted by the access policy engine.';

        case 'DENY':
        case 'DENIED':
            return 'Access was rejected because no active rule allowed this attempt.';

        case 'CREDENTIAL_NOT_FOUND':
            return 'The credential was not registered in the system.';

        case 'CREDENTIAL_INACTIVE':
            return 'The credential exists but is inactive.';

        case 'STUDENT_INACTIVE':
            return 'The student profile is inactive.';

        case 'READER_INACTIVE':
            return 'The reader is inactive.';

        default:
            return 'Backend returned a domain-specific decision reason.';
    }
}