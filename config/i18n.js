// utils/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslation from '../locals/en.json';
import siTranslation from '../locals/si.json';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3', // Add this line for React Native
    resources: {
      en: {
        translation: enTranslation,
      },
      si: {
        translation: siTranslation,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;