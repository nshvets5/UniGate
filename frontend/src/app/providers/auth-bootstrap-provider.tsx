import { ReactNode, useEffect, useState } from 'react';
import { getCurrentUser } from '../../entities/me/api';
import { keycloak } from '../../shared/auth/keycloak';
import {
    clearSession,
    setBootstrapped,
    setSession,
} from '../store/auth.slice';
import { useAppDispatch } from '../store/hooks';

export function AuthBootstrapProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function bootstrap() {
            try {
                const authenticated = await keycloak.init({
                    onLoad: 'check-sso',
                    pkceMethod: 'S256',
                    checkLoginIframe: false,
                });

                if (!authenticated || !keycloak.token) {
                    dispatch(clearSession());
                    dispatch(setBootstrapped(true));
                    if (!cancelled) setIsReady(true);
                    return;
                }

                const me = await getCurrentUser(keycloak.token);

                dispatch(
                    setSession({
                        accessToken: keycloak.token,
                        user: {
                            subject: me.subject,
                            email: me.email,
                            displayName: me.displayName,
                            roles: me.roles,
                        },
                    })
                );

                dispatch(setBootstrapped(true));
            } catch {
                dispatch(clearSession());
                dispatch(setBootstrapped(true));
            } finally {
                if (!cancelled) {
                    setIsReady(true);
                }
            }
        }

        void bootstrap();

        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    if (!isReady) {
        return null;
    }

    return <>{children}</>;
}