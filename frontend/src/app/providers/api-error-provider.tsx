import { ReactNode, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { subscribeToApiErrors } from '../../shared/api/api-error-events';

export function ApiErrorProvider({ children }: { children: ReactNode }) {
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        return subscribeToApiErrors((event) => {
            enqueueSnackbar(event.message, {
                variant: event.status && event.status >= 500 ? 'error' : 'warning',
            });
        });
    }, [enqueueSnackbar]);

    return <>{children}</>;
}