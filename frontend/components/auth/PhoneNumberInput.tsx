import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { theme } from "../../constants/theme";

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

  if (digits.startsWith("255")) {
    digits = `0${digits.slice(3)}`;
  } else if (digits.length > 0 && !digits.startsWith("0")) {
    digits = `0${digits}`;
  }

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
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? "#FCA5A5" : focused ? theme.ctaPrimary : theme.border;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => inputRef.current?.focus()}
      >
        <View
          className="flex-row items-center rounded-2xl border bg-white px-4"
          style={{ borderColor }}
        >
          <View className="mr-3 border-r border-slate-200 pr-3 py-3.5">
            <Text className="font-poppins-medium text-base text-slate-700">+255</Text>
          </View>

          <TextInput
            ref={inputRef}
            accessibilityLabel="Phone number"
            autoComplete="tel"
            autoFocus
            className="flex-1 py-3.5 font-poppins text-base text-slate-900"
            editable={!disabled}
            keyboardType="phone-pad"
            placeholder={placeholder}
            placeholderTextColor={theme.placeholder}
            textContentType="telephoneNumber"
            value={value}
            onBlur={() => setFocused(false)}
            onChangeText={(text) => onChange(formatLocalPhone(text))}
            onFocus={() => setFocused(true)}
          />

          {value.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear phone number"
              accessibilityRole="button"
              className="ml-2 h-8 w-8 items-center justify-center rounded-full"
              disabled={disabled}
              hitSlop={8}
              onPress={() => onChange("")}
            >
              <MaterialIcons color={theme.textMuted} name="close" size={18} />
            </Pressable>
          ) : null}
        </View>
      </Pressable>

      {error ? (
        <View className="mt-1.5 flex-row items-center gap-1.5">
          <MaterialIcons color="#DC2626" name="error-outline" size={16} />
          <Text className="flex-1 font-poppins text-xs text-red-600">{error}</Text>
        </View>
      ) : hint ? (
        <Text className="mt-1.5 font-poppins text-xs text-slate-400">{hint}</Text>
      ) : null}
    </View>
  );
}
