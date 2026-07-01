import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { theme } from "../../constants/theme";

type NameInputProps = {
  value: string;
  onChange: (value: string) => void;
  label: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function NameInput({
  value,
  onChange,
  label,
  error,
  hint,
  placeholder,
  disabled = false,
}: NameInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const borderColor = error ? "#FCA5A5" : focused ? theme.ctaPrimary : theme.border;

  return (
    <View className="mb-5">
      <Text className="mb-2 font-poppins-medium text-sm text-slate-700">{label}</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => inputRef.current?.focus()}
      >
        <View
          className="flex-row items-center rounded-2xl border bg-white px-4"
          style={{ borderColor }}
        >
          <TextInput
            ref={inputRef}
            accessibilityLabel={label}
            autoCapitalize="words"
            autoComplete="name"
            autoCorrect={false}
            className="flex-1 py-3.5 font-poppins text-base text-slate-900"
            editable={!disabled}
            placeholder={placeholder}
            placeholderTextColor={theme.placeholder}
            textContentType="name"
            value={value}
            onBlur={() => setFocused(false)}
            onChangeText={onChange}
            onFocus={() => setFocused(true)}
          />

          {value.length > 0 ? (
            <Pressable
              accessibilityLabel="Clear name"
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
