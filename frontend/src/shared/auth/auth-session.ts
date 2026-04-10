import type { AppDispatch } from '../../app/store';
import { clearSession } from '../../app/store/auth.slice';
import { clearAccessToken } from './token-storage';
import { keycloak } from './keycloak';

export async function endSession(dispatch: AppDispatch) {
    clearAccessToken();
    dispatch(clearSession());

    await keycloak.logout({
        redirectUri: `${window.location.origin}/login`,
    });
}