import { useRef } from "react";
import { useTranslation } from "react-i18next";

import { theme } from "@/constants/theme";

const OTP_LENGTH = 4;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  devCode?: string | null;
  devNotice?: string;
};

export function OtpInput({
  value,
  onChange,
  disabled = false,
  devCode = null,
  devNotice,
}: OtpInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");

  return (
    <div className="flex flex-col gap-4">
      {devCode && devNotice ? (
        <div
          className="rounded-2xl border px-4 py-3"
          style={{
            backgroundColor: theme.feedback.info.bg,
            borderColor: theme.feedback.info.border,
          }}
        >
          <p
            className="font-poppins text-sm leading-5"
            style={{ color: theme.feedback.info.text }}
          >
            {devNotice}
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(devCode);
              inputRef.current?.focus();
            }}
            className="mt-3 w-full rounded-xl bg-white px-4 py-3 text-center font-poppins-bold text-2xl tracking-[0.35em] text-slate-900"
            style={{ boxShadow: theme.shadow.cardSubtle }}
            aria-label={`Use verification code ${devCode}`}
          >
            {devCode}
          </button>
          <p className="mt-2 text-center font-poppins text-xs text-slate-500">
            {t("auth.otpDevTapHint")}
          </p>
        </div>
      ) : null}

      <div>
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.focus()}
          className="flex w-full justify-center gap-3"
        >
          {digits.map((digit, index) => (
            <div
              key={index}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white"
              style={
                digit.trim()
                  ? {
                      borderColor: theme.ctaPrimary,
                      backgroundColor: theme.feedback.info.bg,
                    }
                  : undefined
              }
            >
              <span className="font-poppins-bold text-2xl text-slate-900">
                {digit.trim()}
              </span>
            </div>
          ))}
        </button>
        <input
          ref={inputRef}
          autoComplete="one-time-code"
          disabled={disabled}
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          className="absolute h-0 w-0 opacity-0"
          value={value}
          onChange={(e) =>
            onChange(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
          }
        />
      </div>
    </div>
  );
}
