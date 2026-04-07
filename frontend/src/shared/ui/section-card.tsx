import { Paper } from '@mui/material';
import type { PaperProps } from '@mui/material';
import { ReactNode } from 'react';

type SectionCardProps = PaperProps & {
    children: ReactNode;
};

export function SectionCard({ children, sx, ...rest }: SectionCardProps) {
    return (
        <Paper
            {...rest}
            sx={{
                p: 3,
                borderRadius: 4,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                ...sx,
            }}
        >
            {children}
        </Paper>
    );
}