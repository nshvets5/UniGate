import '../i18n/i18n';
import { ReactNode } from 'react';

export function I18nProvider({ children }: { children: ReactNode }) {
    return <>{children}</>;
}