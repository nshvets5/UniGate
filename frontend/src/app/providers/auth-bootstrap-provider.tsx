import { useQuery } from '@tanstack/react-query';
import { ReactNode, useEffect } from 'react';
import { getCurrentUser } from '../../entities/me/api';
import { clearSession, setUser } from '../store/auth.slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAccessToken } from '../../shared/auth/token-storage';

export function AuthBootstrapProvider({ children }: { children: ReactNode }) {
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const meQuery = useQuery({
        queryKey: ['auth', 'me'],
        queryFn: getCurrentUser,
        enabled: isAuthenticated,
        retry: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (!isAuthenticated) return;

        if (meQuery.isSuccess) {
            dispatch(setUser(meQuery.data));
        }
    }, [dispatch, isAuthenticated, meQuery.isSuccess, meQuery.data]);

    useEffect(() => {
        if (!isAuthenticated) return;

        if (meQuery.isError) {
            clearAccessToken();
            dispatch(clearSession());
        }
    }, [dispatch, isAuthenticated, meQuery.isError]);

    return <>{children}</>;
}