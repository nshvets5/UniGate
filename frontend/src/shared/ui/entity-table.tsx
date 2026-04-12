import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

type EntityTableProps = {
    columns: ReactNode;
    children: ReactNode;
    gridTemplateColumns: string;
};

export function EntityTable({
                                columns,
                                children,
                                gridTemplateColumns,
                            }: EntityTableProps) {
    return (
        <Box>
            <Box
                sx={{
                    px: 2.25,
                    mb: 1.25,
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns,
                    alignItems: 'center',
                    columnGap: 2,
                }}
            >
                {columns}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                {children}
            </Box>
        </Box>
    );
}

type EntityTableHeaderCellProps = {
    children: ReactNode;
    align?: 'left' | 'center' | 'right';
};

export function EntityTableHeaderCell({
                                          children,
                                          align = 'left',
                                      }: EntityTableHeaderCellProps) {
    return (
        <Typography
            variant="caption"
            sx={{
                color: 'text.secondary',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                textAlign: align,
            }}
        >
            {children}
        </Typography>
    );
}