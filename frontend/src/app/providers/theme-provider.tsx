import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import { useAppSelector } from '../store/hooks';
import { darkTokens, lightTokens } from '../theme/tokens';

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
    const themeMode = useAppSelector((state) => state.preferences.themeMode);
    const isDark = themeMode === 'dark';
    const tokens = isDark ? darkTokens : lightTokens;

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: themeMode,
                    primary: {
                        main: tokens.primary.main,
                        light: tokens.primary.light,
                        dark: tokens.primary.dark,
                        contrastText: tokens.primary.contrastText,
                    },
                    background: {
                        default: tokens.background.default,
                        paper: tokens.background.paper,
                    },
                    text: {
                        primary: tokens.text.primary,
                        secondary: tokens.text.secondary,
                    },
                    divider: tokens.divider,
                },
                shape: {
                    borderRadius: 16,
                },
                typography: {
                    fontFamily: [
                        'Inter',
                        'system-ui',
                        '-apple-system',
                        'BlinkMacSystemFont',
                        '"Segoe UI"',
                        'sans-serif',
                    ].join(','),
                    h4: {
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                    },
                    h5: {
                        fontSize: '1.375rem',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                    },
                    h6: {
                        fontSize: '1.05rem',
                        fontWeight: 700,
                    },
                    subtitle1: {
                        fontSize: '1rem',
                        fontWeight: 600,
                    },
                    body1: {
                        fontSize: '0.95rem',
                    },
                    body2: {
                        fontSize: '0.875rem',
                    },
                    button: {
                        fontWeight: 600,
                        textTransform: 'none',
                    },
                },
                components: {
                    MuiCssBaseline: {
                        styleOverrides: {
                            body: {
                                backgroundImage: isDark
                                    ? 'radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 28%)'
                                    : 'radial-gradient(circle at top left, rgba(37,99,235,0.05), transparent 28%)',
                            },
                        },
                    },
                    MuiAppBar: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                                boxShadow: 'none',
                                backdropFilter: 'blur(14px)',
                            },
                        },
                    },
                    MuiDrawer: {
                        styleOverrides: {
                            paper: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundImage: 'none',
                            },
                        },
                    },
                    MuiCard: {
                        styleOverrides: {
                            root: {
                                borderRadius: 20,
                                boxShadow: tokens.shadow.md,
                            },
                        },
                    },
                    MuiButton: {
                        defaultProps: {
                            disableElevation: true,
                        },
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                                minHeight: 40,
                                paddingInline: 16,
                            },
                            contained: {
                                boxShadow: 'none',
                            },
                        },
                    },
                    MuiIconButton: {
                        styleOverrides: {
                            root: {
                                borderRadius: 12,
                            },
                        },
                    },
                    MuiListItemButton: {
                        styleOverrides: {
                            root: {
                                minHeight: 44,
                                borderRadius: 12,
                            },
                        },
                    },
                    MuiToolbar: {
                        styleOverrides: {
                            root: {
                                minHeight: '72px',
                            },
                        },
                    },
                },
            }),
        [themeMode, isDark, tokens]
    );

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}