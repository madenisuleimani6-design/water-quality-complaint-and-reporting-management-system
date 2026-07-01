import { AlertCircle, X } from "lucide-react";
import { useRef, useState } from "react";

import { theme } from "@/constants/theme";

type PhoneNumberInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
};

function formatLocalPhone(input: string): string {
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("255")) digits = `0${digits.slice(3)}`;
  else if (digits.length > 0 && !digits.startsWith("0")) digits = `0${digits}`;
  digits = digits.slice(0, 10);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function PhoneNumberInput({
  value,
  onChange,
  error,
  hint,
  placeholder,
  disabled = false,
}: PhoneNumberInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "#FCA5A5" : focused ? theme.ctaPrimary : theme.border;

  return (
    <div>
      <div
        className="w-full cursor-text"
        onClick={() => inputRef.current?.focus()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.focus();
          }
        }}
        role="presentation"
      >
        <div
          className="flex items-center rounded-2xl border bg-white px-4"
          style={{ borderColor }}
        >
          <div className="mr-3 border-r border-slate-200 py-3.5 pr-3">
            <span className="font-poppins-medium text-base text-slate-700">+255</span>
          </div>
          <input
            ref={inputRef}
            aria-label="Phone number"
            autoComplete="tel"
            autoFocus
            disabled={disabled}
            inputMode="tel"
            className="min-w-0 flex-1 bg-transparent py-3.5 font-poppins text-base text-slate-900 outline-none"
            placeholder={placeholder}
            value={value}
            onBlur={() => setFocused(false)}
            onChange={(e) => onChange(formatLocalPhone(e.target.value))}
            onFocus={() => setFocused(true)}
          />
          {value.length > 0 ? (
            <button
              type="button"
              aria-label="Clear phone number"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
                inputRef.current?.focus();
              }}
              className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            >
              <X className="h-[18px] w-[18px]" style={{ color: theme.textMuted }} />
            </button>
          ) : null}
        </div>
      </div>
      {error ? (
        <div className="mt-1.5 flex items-center gap-1.5">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="flex-1 font-poppins text-xs text-red-600">{error}</p>
        </div>
      ) : hint ? (
        <p className="mt-1.5 font-poppins text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
