import { ComponentType } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import { theme } from "../constants/theme";

type FormFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
  multiline?: boolean;
  InputComponent?: ComponentType<TextInputProps>;
};

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  multiline = false,
  InputComponent = TextInput,
}: FormFieldProps) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 font-poppins-medium text-sm text-slate-700">
        {label}
      </Text>
      <InputComponent
        accessibilityLabel={label}
        className={`rounded-2xl border bg-white px-4 py-3.5 font-poppins text-base text-slate-900 ${
          error ? "border-red-300" : "border-slate-200"
        } ${multiline ? "min-h-[96px]" : ""}`}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        textAlignVertical={multiline ? "top" : "auto"}
        value={value}
        onChangeText={onChangeText}
      />
      {error ? (
        <Text className="mt-1 font-poppins text-xs text-red-600">{error}</Text>
      ) : null}
    </View>
  );
}
