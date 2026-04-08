import { configureStore } from '@reduxjs/toolkit';
import { preferencesReducer } from './preferences.slice';
import { authReducer } from './auth.slice';

export const store = configureStore({
    reducer: {
        preferences: preferencesReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;