import { Box } from '@mui/material';
import { ReactNode } from 'react';

export function EntityRow({ children }: { children: ReactNode }) {
    return (
        <Box
            sx={{
                px: 2,
                py: 1.75,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                bgcolor: 'background.paper',
                transition: 'all 0.18s ease',
                '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                            ? '0 8px 24px rgba(2, 6, 23, 0.28)'
                            : '0 8px 24px rgba(15, 23, 42, 0.08)',
                },
            }}
        >
            {children}
        </Box>
    );
}