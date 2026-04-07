import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

type PageHeaderProps = {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
    return (
        <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            gap={2}
        >
            <Box>
                <Typography variant="h4">{title}</Typography>
                {subtitle ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        {subtitle}
                    </Typography>
                ) : null}
            </Box>

            {actions ? <Box>{actions}</Box> : null}
        </Stack>
    );
}