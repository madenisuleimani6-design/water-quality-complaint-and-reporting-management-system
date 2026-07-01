import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import sw from "../locales/sw.json";
import { AppLanguage } from "../constants/config";

const resources = {
  en: { translation: en },
  sw: { translation: sw },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export function setAppLanguage(language: AppLanguage) {
  return i18n.changeLanguage(language);
}

export default i18n;
