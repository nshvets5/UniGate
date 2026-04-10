import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

type EntityRowProps = {
    children: ReactNode;
    accentColor?: string;
};

export function EntityRow({ children, accentColor }: EntityRowProps) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'relative',
                px: 2.25,
                py: 1.9,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3.5,
                bgcolor: 'background.paper',
                transition: 'border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease',
                overflow: 'hidden',
                '&::before': accentColor
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 10,
                        bottom: 10,
                        width: 4,
                        borderRadius: 999,
                        backgroundColor: accentColor,
                    }
                    : undefined,
                '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.22),
                    boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 8px 18px rgba(2, 6, 23, 0.22)'
                            : '0 8px 18px rgba(15, 23, 42, 0.06)',
                },
            }}
        >
            {children}
        </Box>
    );
}