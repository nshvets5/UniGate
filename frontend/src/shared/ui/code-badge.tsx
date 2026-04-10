import { Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export function CodeBadge({ value }: { value: string }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                px: 1.25,
                py: 0.6,
                borderRadius: 2,
                bgcolor:
                    theme.palette.mode === 'dark'
                        ? alpha(theme.palette.primary.main, 0.14)
                        : alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    color: 'primary.main',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}