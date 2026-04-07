import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { Box, Button, Typography } from '@mui/material';

type ErrorStateProps = {
    title?: string;
    description?: string;
    onRetry?: () => void;
};

export function ErrorState({
                               title = 'Something went wrong',
                               description = 'An unexpected error occurred while loading this section.',
                               onRetry,
                           }: ErrorStateProps) {
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
                <ErrorOutlineOutlinedIcon />
            </Box>

            <Box>
                <Typography variant="subtitle1">{title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 480 }}>
                    {description}
                </Typography>
            </Box>

            {onRetry ? (
                <Button variant="contained" startIcon={<RefreshOutlinedIcon />} onClick={onRetry}>
                    Retry
                </Button>
            ) : null}
        </Box>
    );
}