import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';

type EmptyStateProps = {
    title?: string;
    description?: string;
    action?: ReactNode;
};

export function EmptyState({
                               title = 'No data available',
                               description = 'There are no records to display for the current selection.',
                               action,
                           }: EmptyStateProps) {
    return (
        <Box
            sx={{
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                textAlign: 'center',
                px: 2,
            }}
        >
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'action.hover',
                }}
            >
                <InboxOutlinedIcon />
            </Box>

            <Box>
                <Typography variant="subtitle1">{title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 480 }}>
                    {description}
                </Typography>
            </Box>

            {action ?? null}
        </Box>
    );
}