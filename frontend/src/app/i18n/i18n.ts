import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

void i18n.use(initReactI18next).init({
    resources: {
        en: {
            translation: {
                'app.title': 'UniGate',
                'navigation.dashboard': 'Dashboard',
                'navigation.groups': 'Groups',
                'navigation.students': 'Students',
                'navigation.zones': 'Zones',
                'navigation.attempts': 'Attempts',
                'navigation.readers': 'Readers',
                'navigation.emulator': 'Emulator',
                'navigation.audit': 'Audit',
                'layout.admin': 'Admin Panel',
                'actions.switchTheme': 'Switch theme',
                'actions.switchLanguage': 'Switch language',
                'pages.dashboard.title': 'Dashboard',
                'pages.groups.title': 'Groups',
                'pages.students.title': 'Students',
            },
        },
        uk: {
            translation: {
                'app.title': 'UniGate',
                'navigation.dashboard': 'Панель',
                'navigation.groups': 'Групи',
                'navigation.students': 'Студенти',
                'navigation.zones': 'Зони',
                'navigation.attempts': 'Спроби входу',
                'navigation.readers': 'Зчитувачі',
                'navigation.emulator': 'Емулятор',
                'navigation.audit': 'Аудит',
                'layout.admin': 'Панель адміністратора',
                'actions.switchTheme': 'Змінити тему',
                'actions.switchLanguage': 'Змінити мову',
                'pages.dashboard.title': 'Панель',
                'pages.groups.title': 'Групи',
                'pages.students.title': 'Студенти',
            },
        },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;