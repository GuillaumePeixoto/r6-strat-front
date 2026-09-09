import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translations from './locales/translations.json';

const resources = Object.fromEntries(
  Object.entries(translations).map(([lang, content]) => [
    lang,
    { translation: content },
  ])
);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // si la langue détectée n'est pas dans tes traductions
    interpolation: { escapeValue: false },
  });

export default i18n;