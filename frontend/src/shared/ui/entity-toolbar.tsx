import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Box, Button, Stack, TextField } from '@mui/material';
import { ReactNode } from 'react';

type EntityToolbarProps = {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
    primaryAction?: ReactNode;
    secondaryActions?: ReactNode;
};

export function EntityToolbar({
                                  searchValue = '',
                                  onSearchChange,
                                  searchPlaceholder = 'Search...',
                                  primaryAction,
                                  secondaryActions,
                              }: EntityToolbarProps) {
    return (
        <Stack
            direction={{ xs: 'column', lg: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', lg: 'center' }}
            gap={2}
        >
            <Box sx={{ flex: 1, maxWidth: 420 }}>
                <TextField
                    fullWidth
                    value={searchValue}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    placeholder={searchPlaceholder}
                    InputProps={{
                        startAdornment: <SearchOutlinedIcon fontSize="small" style={{ marginRight: 8 }} />,
                    }}
                />
            </Box>

            <Stack direction="row" spacing={1.5} alignItems="center">
                {secondaryActions}
                {primaryAction}
            </Stack>
        </Stack>
    );
}