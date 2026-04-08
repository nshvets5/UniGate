import { QueryProvider } from './query-provider';
import { StoreProvider } from './store-provider';
import { ThemeProviderWrapper } from './theme-provider';
import { I18nProvider } from './i18n-provider';
import { RouterProviderWrapper } from './router-provider';
import { SnackbarProvider } from 'notistack';
import { AuthBootstrapProvider } from './auth-bootstrap-provider';

export function AppProviders() {
    return (
        <StoreProvider>
            <QueryProvider>
                <I18nProvider>
                    <ThemeProviderWrapper>
                        <SnackbarProvider maxSnack={3}>
                            <AuthBootstrapProvider>
                                <RouterProviderWrapper />
                            </AuthBootstrapProvider>
                        </SnackbarProvider>
                    </ThemeProviderWrapper>
                </I18nProvider>
            </QueryProvider>
        </StoreProvider>
    );
}