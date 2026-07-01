import { useTranslation } from "react-i18next";

type NoteInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export function NoteInput({ value, onChangeText }: NoteInputProps) {
  const { t } = useTranslation();

  return (
    <textarea
      aria-label={t("confirm.notePlaceholder")}
      className="min-h-[96px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-poppins text-base text-slate-900 outline-none focus:ring-2 focus:ring-dawasa-cta"
      placeholder={t("confirm.notePlaceholder")}
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
    />
  );
}
