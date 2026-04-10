import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

type EntityTableProps = {
    columns: ReactNode;
    children: ReactNode;
};

export function EntityTable({ columns, children }: EntityTableProps) {
    return (
        <Box>
            <Box
                sx={{
                    px: 2.25,
                    mb: 1.25,
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns: 'minmax(280px, 2fr) 170px 150px 150px',
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
                pl: align === 'left' ? 0.5 : 0,
            }}
        >
            {children}
        </Typography>
    );
}