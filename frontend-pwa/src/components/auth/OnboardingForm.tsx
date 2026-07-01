import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { AppLanguage } from "@/constants/config";
import { theme } from "@/constants/theme";
import { Input } from "@/components/ui/input";

type OnboardingFormProps = {
  fullName: string;
  language: AppLanguage;
  onChangeFullName: (value: string) => void;
  onChangeLanguage: (language: AppLanguage) => void;
  nameError?: string;
};

const LANGUAGES: AppLanguage[] = ["en", "sw"];

export function OnboardingForm({
  fullName,
  language,
  onChangeFullName,
  onChangeLanguage,
  nameError,
}: OnboardingFormProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="mb-2 block font-poppins-medium text-sm text-slate-700">
        {t("profile.fullName")}
      </label>
      <Input
        value={fullName}
        placeholder={t("profile.fullNamePlaceholder")}
        onChange={(e) => onChangeFullName(e.target.value)}
      />
      {nameError ? (
        <p className="mt-1.5 font-poppins text-xs text-red-600">{nameError}</p>
      ) : (
        <p className="mt-1.5 font-poppins text-xs text-slate-400">
          {t("auth.onboardingNameHint")}
        </p>
      )}

      <p className="mb-2 mt-4 font-poppins-medium text-sm text-slate-700">
        {t("profile.language")}
      </p>
      <div className="flex flex-col gap-2">
        {LANGUAGES.map((lang) => {
          const selected = language === lang;
          return (
            <button
              key={lang}
              type="button"
              aria-pressed={selected}
              className="flex items-center rounded-2xl border px-4 py-3.5 text-left"
              style={{
                backgroundColor: selected ? theme.feedback.info.bg : theme.card,
                borderColor: selected ? theme.ctaPrimary : theme.border,
              }}
              onClick={() => onChangeLanguage(lang)}
            >
              <div className="flex-1">
                <p
                  className="font-poppins-semibold text-base"
                  style={{ color: selected ? theme.ctaPrimary : theme.ctaDark }}
                >
                  {t(`language.${lang}`)}
                </p>
                <p className="mt-0.5 font-poppins text-sm text-slate-500">
                  {t(`profile.languageName.${lang}`)}
                </p>
              </div>
              {selected ? (
                <CheckCircle className="h-[22px] w-[22px]" style={{ color: theme.ctaPrimary }} />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
