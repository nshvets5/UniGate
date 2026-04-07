import { Box } from '@mui/material';
import { ReactNode } from 'react';

export function PageContainer({ children }: { children: ReactNode }) {
    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 1440,
                mx: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
            }}
        >
            {children}
        </Box>
    );
}