import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import {
    Box,
    Button,
    Divider,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useAuditEventsQuery } from '../features/audit/list-audit-events/use-audit-events-query';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

function formatDateTime(value: string) {
    return new Date(value).toLocaleString();
}

function getEventVariant(type: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
    const normalized = type.toLowerCase();

    if (normalized.includes('created') || normalized.includes('provisioned')) {
        return 'success';
    }

    if (normalized.includes('updated') || normalized.includes('changed')) {
        return 'info';
    }

    if (normalized.includes('deleted') || normalized.includes('deactivated')) {
        return 'warning';
    }

    if (normalized.includes('failed') || normalized.includes('denied') || normalized.includes('alert')) {
        return 'error';
    }

    return 'default';
}

export function AuditPage() {
    const theme = useTheme();

    const [type, setType] = useState('');
    const [resourceType, setResourceType] = useState('');
    const [actorId, setActorId] = useState('');

    const queryParams = useMemo(
        () => ({
            type: type.trim() || undefined,
            resourceType: resourceType.trim() || undefined,
            actorId: actorId.trim() || undefined,
            page: 1,
            pageSize: 50,
        }),
        [type, resourceType, actorId]
    );

    const auditQuery = useAuditEventsQuery(queryParams);

    return (
        <PageContainer>
            <PageHeader
                title="Audit events"
                subtitle="Trace administrative actions, access events and system activity."
            />

            <SectionCard>
                <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', lg: 'flex-end' }}
                >
                    <TextField
                        label="Event type"
                        value={type}
                        onChange={(event) => setType(event.target.value)}
                        fullWidth
                        placeholder="student.created"
                    />

                    <TextField
                        label="Resource type"
                        value={resourceType}
                        onChange={(event) => setResourceType(event.target.value)}
                        fullWidth
                        placeholder="Student"
                    />

                    <TextField
                        label="Actor ID"
                        value={actorId}
                        onChange={(event) => setActorId(event.target.value)}
                        fullWidth
                    />

                    <Button
                        variant="outlined"
                        onClick={() => {
                            setType('');
                            setResourceType('');
                            setActorId('');
                        }}
                    >
                        Clear
                    </Button>
                </Stack>
            </SectionCard>

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1">Activity log</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Latest audit events recorded by the system.
                    </Typography>
                </Box>

                <Divider />

                {auditQuery.isLoading ? (
                    <LoadingState
                        title="Loading audit events"
                        description="Please wait while audit events are being loaded."
                    />
                ) : auditQuery.isError ? (
                    <ErrorState
                        title="Failed to load audit events"
                        description="Audit events could not be loaded from the server."
                        onRetry={() => void auditQuery.refetch()}
                    />
                ) : !auditQuery.data || auditQuery.data.items.length === 0 ? (
                    <EmptyState
                        title="No audit events found"
                        description="No events match the current filters."
                    />
                ) : (
                    <Stack spacing={0} divider={<Divider />}>
                        {auditQuery.data.items.map((event) => (
                            <Box
                                key={event.id}
                                sx={{
                                    p: 2.5,
                                    display: 'grid',
                                    gridTemplateColumns: {
                                        xs: '1fr',
                                        md: '48px minmax(0, 1fr) 180px',
                                    },
                                    gap: 2,
                                    alignItems: 'flex-start',
                                    transition: 'background-color 0.18s ease',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                                    },
                                }}
                            >
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
                                    <EventNoteOutlinedIcon />
                                </Box>

                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        <StatusChip
                                            label={event.type}
                                            variant={getEventVariant(event.type)}
                                        />

                                        {event.resourceType ? (
                                            <StatusChip label={event.resourceType} variant="default" />
                                        ) : null}
                                    </Stack>

                                    <Typography variant="subtitle1">
                                        {event.type}
                                    </Typography>

                                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                            <AccountCircleOutlinedIcon fontSize="small" color="disabled" />
                                            <Typography variant="body2" color="text.secondary">
                                                {event.actorSubject || event.actorProvider || 'System'}
                                            </Typography>
                                        </Stack>

                                        {event.resourceId ? (
                                            <Stack direction="row" spacing={0.75} alignItems="center">
                                                <Inventory2OutlinedIcon fontSize="small" color="disabled" />
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ wordBreak: 'break-all' }}
                                                >
                                                    {event.resourceId}
                                                </Typography>
                                            </Stack>
                                        ) : null}
                                    </Stack>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        textAlign: { xs: 'left', md: 'right' },
                                    }}
                                >
                                    {formatDateTime(event.occurredAt)}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                )}
            </SectionCard>
        </PageContainer>
    );
}