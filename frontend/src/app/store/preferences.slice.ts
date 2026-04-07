import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark';
export type Locale = 'en' | 'uk';

type PreferencesState = {
    themeMode: ThemeMode;
    locale: Locale;
};

const initialState: PreferencesState = {
    themeMode: 'light',
    locale: 'en',
};

const preferencesSlice = createSlice({
    name: 'preferences',
    initialState,
    reducers: {
        setThemeMode(state, action: PayloadAction<ThemeMode>) {
            state.themeMode = action.payload;
        },
        toggleThemeMode(state) {
            state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
        },
        setLocale(state, action: PayloadAction<Locale>) {
            state.locale = action.payload;
        },
        toggleLocale(state) {
            state.locale = state.locale === 'en' ? 'uk' : 'en';
        },
    },
});

export const { setThemeMode, toggleThemeMode, setLocale, toggleLocale } =
    preferencesSlice.actions;

export const preferencesReducer = preferencesSlice.reducer;