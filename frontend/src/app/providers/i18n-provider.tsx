import '../i18n/i18n';
import { ReactNode, useEffect } from 'react';
import i18n from '../i18n/i18n';
import { useAppSelector } from '../store/hooks';

function I18nSync({ children }: { children: ReactNode }) {
    const locale = useAppSelector((state) => state.preferences.locale);

    useEffect(() => {
        void i18n.changeLanguage(locale);
    }, [locale]);

    return <>{children}</>;
}

export function I18nProvider({ children }: { children: ReactNode }) {
    return <I18nSync>{children}</I18nSync>;
}