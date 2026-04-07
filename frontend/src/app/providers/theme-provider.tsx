import { ThemeProvider, CssBaseline } from '@mui/material';
import { ReactNode } from 'react';
import { theme } from '../theme/theme';

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}