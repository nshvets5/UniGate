import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type AuthUser = {
    subject: string;
    email: string | null;
    displayName: string | null;
    roles: string[];
};

type AuthState = {
    isAuthenticated: boolean;
    isBootstrapped: boolean;
    accessToken: string | null;
    user: AuthUser | null;
};

const initialState: AuthState = {
    isAuthenticated: false,
    isBootstrapped: false,
    accessToken: null,
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setSession(
            state,
            action: PayloadAction<{
                accessToken: string;
                user: AuthUser;
            }>
        ) {
            state.isAuthenticated = true;
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
        },
        clearSession(state) {
            state.isAuthenticated = false;
            state.accessToken = null;
            state.user = null;
        },
        setUser(state, action: PayloadAction<AuthUser | null>) {
            state.user = action.payload;
        },
        setBootstrapped(state, action: PayloadAction<boolean>) {
            state.isBootstrapped = action.payload;
        },
    },
});

export const { setSession, clearSession, setUser, setBootstrapped } =
    authSlice.actions;

export const authReducer = authSlice.reducer;