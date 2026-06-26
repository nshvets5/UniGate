import { Box, Stack, Typography } from '@mui/material';
import type { AttemptDto } from '../../entities/attempt/api';
import { StatusChip } from '../../shared/ui/status-chip';

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

export function RecentAttemptRow({
                                     attempt,
                                 }: {
    attempt: AttemptDto;
}) {
    return (
        <Box
            sx={{
                p: 1.45,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                spacing={1.5}
                alignItems="center"
            >
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

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                    >
                        {attempt.credentialType.toUpperCase()} ·{' '}
                        {formatDateTime(attempt.occurredAt)}
                    </Typography>
                </Stack>

                <StatusChip
                    label={attempt.isAllowed ? 'ALLOW' : 'DENY'}
                    variant={attempt.isAllowed ? 'success' : 'error'}
                />
            </Stack>
        </Box>
    );
}