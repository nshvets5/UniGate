import { Box, CircularProgress, Typography } from '@mui/material';

type LoadingStateProps = {
    title?: string;
    description?: string;
};

export function LoadingState({
                                 title = 'Loading',
                                 description = 'Please wait while data is being loaded.',
                             }: LoadingStateProps) {
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
            }}
        >
            <CircularProgress size={32} />
            <Box>
                <Typography variant="subtitle1">{title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {description}
                </Typography>
            </Box>
        </Box>
    );
}