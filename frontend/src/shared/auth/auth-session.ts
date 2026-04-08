import type { AppDispatch } from '../../app/store';
import type { AuthUser } from '../../app/store/auth.slice';
import { clearSession, setSession } from '../../app/store/auth.slice';
import {
    clearAccessToken,
    setAccessToken,
} from './token-storage';

export function startSession(
    dispatch: AppDispatch,
    payload: {
        accessToken: string;
        user: AuthUser;
    }
) {
    setAccessToken(payload.accessToken);
    dispatch(setSession(payload));
}

export function endSession(dispatch: AppDispatch) {
    clearAccessToken();
    dispatch(clearSession());
}