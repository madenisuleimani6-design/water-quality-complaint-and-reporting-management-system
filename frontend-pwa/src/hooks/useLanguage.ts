import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  type AppLanguage,
  SUPPORTED_LANGUAGES,
  STORAGE_KEYS,
} from "@/constants/config";
import { setAppLanguage } from "@/i18n";
import { storage } from "@/lib/storage";

export function useLanguage() {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    storage.getItem(STORAGE_KEYS.language).then((stored) => {
      if (stored && SUPPORTED_LANGUAGES.includes(stored as AppLanguage)) {
        setAppLanguage(stored as AppLanguage);
      }
      setReady(true);
    });
  }, []);

  const toggleLanguage = useCallback(async () => {
    const next: AppLanguage = i18n.language === "sw" ? "en" : "sw";
    await setAppLanguage(next);
    await storage.setItem(STORAGE_KEYS.language, next);
  }, [i18n.language]);

  const currentLanguage = (i18n.language === "sw" ? "sw" : "en") as AppLanguage;

  return { ready, currentLanguage, toggleLanguage };
}
