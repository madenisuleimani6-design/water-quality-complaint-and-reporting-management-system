import { useRef } from "react";

import { theme } from "@/constants/theme";

const OTP_LENGTH = 4;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");

  return (
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
  );
}
