import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

export function RowActions({ children }: { children: ReactNode }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.5,
                py: 0.35,
                borderRadius: 999,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor:
                    theme.palette.mode === 'dark'
                        ? alpha(theme.palette.common.white, 0.02)
                        : alpha(theme.palette.common.black, 0.015),
            }}
        >
            {children}
        </Box>
    );
}