import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
    const themeMode = useAppSelector((state) => state.preferences.themeMode);

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: themeMode,
                    primary: {
                        main: '#1565c0',
                    },
                },
                shape: {
                    borderRadius: 12,
                },
            }),
        [themeMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}