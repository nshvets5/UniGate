import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

type EntityTableProps = {
    columns: ReactNode;
    children: ReactNode;
};

export function EntityTable({ columns, children }: EntityTableProps) {
    return (
        <Stack spacing={1.5}>
            <Box
                sx={{
                    px: 2,
                    display: { xs: 'none', md: 'grid' },
                    gridTemplateColumns: 'minmax(280px, 2fr) 160px 140px 140px',
                    alignItems: 'center',
                    columnGap: 2,
                }}
            >
                {columns}
            </Box>

            <Stack spacing={1.25}>{children}</Stack>
        </Stack>
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