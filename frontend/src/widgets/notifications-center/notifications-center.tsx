import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import {
    Badge,
    Box,
    Drawer,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useAuditEventsQuery } from '../../features/audit/list-audit-events/use-audit-events-query';
import { StatusChip } from '../../shared/ui/status-chip';

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function getSeverity(type: string): 'success' | 'warning' | 'error' | 'info' | 'default' {
    const normalized = type.toLowerCase();

    if (
        normalized.includes('alert') ||
        normalized.includes('denied') ||
        normalized.includes('failed') ||
        normalized.includes('offline')
    ) {
        return 'error';
    }

    if (
        normalized.includes('deactivated') ||
        normalized.includes('changed')
    ) {
        return 'warning';
    }

    if (
        normalized.includes('created') ||
        normalized.includes('provisioned') ||
        normalized.includes('completed')
    ) {
        return 'success';
    }

    if (normalized.includes('updated') || normalized.includes('sync')) {
        return 'info';
    }

    return 'default';
}

export function NotificationsCenter() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);

    const auditQuery = useAuditEventsQuery({
        page: 1,
        pageSize: 12,
    });

    const events = auditQuery.data?.items ?? [];
    const importantCount = events.filter((event) => {
        const severity = getSeverity(event.type);
        return severity === 'error' || severity === 'warning';
    }).length;

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton onClick={() => setOpen(true)}>
                    <Badge
                        badgeContent={importantCount}
                        color={importantCount > 0 ? 'error' : 'default'}
                    >
                        <NotificationsOutlinedIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Drawer
                anchor="right"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    sx: {
                        width: { xs: '100%', sm: 420 },
                        bgcolor: 'background.default',
                    },
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack spacing={0.5}>
                            <Typography variant="h6">Notifications</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Recent operational activity and system signals.
                            </Typography>
                        </Stack>

                        <IconButton onClick={() => setOpen(false)}>
                            <CloseOutlinedIcon />
                        </IconButton>
                    </Stack>
                </Box>

                <Box sx={{ p: 2 }}>
                    {auditQuery.isLoading ? (
                        <Typography variant="body2" color="text.secondary">
                            Loading notifications...
                        </Typography>
                    ) : auditQuery.isError ? (
                        <Typography variant="body2" color="error">
                            Failed to load notifications.
                        </Typography>
                    ) : events.length === 0 ? (
                        <Box
                            sx={{
                                py: 8,
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="subtitle1">No notifications</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                System activity will appear here.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack spacing={1.25}>
                            {events.map((event) => {
                                const severity = getSeverity(event.type);

                                return (
                                    <Box
                                        key={event.id}
                                        sx={{
                                            p: 2,
                                            borderRadius: 3,
                                            border: '1px solid',
                                            borderColor:
                                                severity === 'error'
                                                    ? alpha(theme.palette.error.main, 0.25)
                                                    : severity === 'warning'
                                                        ? alpha(theme.palette.warning.main, 0.25)
                                                        : 'divider',
                                            bgcolor:
                                                severity === 'error'
                                                    ? alpha(theme.palette.error.main, 0.045)
                                                    : severity === 'warning'
                                                        ? alpha(theme.palette.warning.main, 0.045)
                                                        : 'background.paper',
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                justifyContent="space-between"
                                                alignItems="flex-start"
                                            >
                                                <StatusChip label={event.type} variant={severity} />

                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ whiteSpace: 'nowrap' }}
                                                >
                                                    {formatDateTime(event.occurredAt)}
                                                </Typography>
                                            </Stack>

                                            <Typography variant="body2" color="text.secondary">
                                                Resource: {event.resourceType ?? 'system'}
                                            </Typography>

                                            {event.resourceId ? (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ wordBreak: 'break-all' }}
                                                >
                                                    {event.resourceId}
                                                </Typography>
                                            ) : null}
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Stack>
                    )}
                </Box>
            </Drawer>
        </>
    );
}