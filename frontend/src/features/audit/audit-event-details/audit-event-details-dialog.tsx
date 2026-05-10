import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import type { AuditEventDto } from '../../../entities/audit/api';
import { CodeBadge } from '../../../shared/ui/code-badge';
import { StatusChip } from '../../../shared/ui/status-chip';

type Props = {
    open: boolean;
    event: AuditEventDto | null;
    onClose: () => void;
};

function formatJson(value: string | null) {
    if (!value) return 'No payload';

    try {
        return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
        return value;
    }
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

export function AuditEventDetailsDialog({ open, event, onClose }: Props) {
    if (!event) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                Audit event details

                <IconButton onClick={onClose}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3}>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <StatusChip label={event.type} variant="info" />
                            {event.resourceType ? (
                                <StatusChip label={event.resourceType} variant="default" />
                            ) : null}
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            Occurred at: {formatDateTime(event.occurredAt)}
                        </Typography>
                    </Stack>

                    <Divider />

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <Stack spacing={0.75}>
                            <Typography variant="body2" color="text.secondary">
                                Actor provider
                            </Typography>
                            <Typography variant="body2">
                                {event.actorProvider ?? '—'}
                            </Typography>
                        </Stack>

                        <Stack spacing={0.75}>
                            <Typography variant="body2" color="text.secondary">
                                Actor subject
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {event.actorSubject ?? '—'}
                            </Typography>
                        </Stack>

                        <Stack spacing={0.75}>
                            <Typography variant="body2" color="text.secondary">
                                Resource ID
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {event.resourceId ?? '—'}
                            </Typography>
                        </Stack>

                        <Stack spacing={0.75}>
                            <Typography variant="body2" color="text.secondary">
                                Correlation ID
                            </Typography>
                            {event.correlationId ? (
                                <CodeBadge value={event.correlationId} />
                            ) : (
                                <Typography variant="body2">—</Typography>
                            )}
                        </Stack>

                        <Stack spacing={0.75}>
                            <Typography variant="body2" color="text.secondary">
                                Trace ID
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {event.traceId ?? '—'}
                            </Typography>
                        </Stack>

                        <Stack spacing={0.75}>
                            <Typography variant="body2" color="text.secondary">
                                Source message ID
                            </Typography>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {event.sourceMessageId ?? '—'}
                            </Typography>
                        </Stack>
                    </Box>

                    <Divider />

                    <Stack spacing={1}>
                        <Typography variant="subtitle1">Payload</Typography>

                        <Box
                            component="pre"
                            sx={{
                                m: 0,
                                p: 2,
                                borderRadius: 2,
                                bgcolor: 'background.default',
                                border: '1px solid',
                                borderColor: 'divider',
                                overflow: 'auto',
                                maxHeight: 360,
                                fontSize: 13,
                                lineHeight: 1.6,
                            }}
                        >
                            {formatJson(event.dataJson)}
                        </Box>
                    </Stack>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}