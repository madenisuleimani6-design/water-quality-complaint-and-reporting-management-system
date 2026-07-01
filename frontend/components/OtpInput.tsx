import { useRef } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { theme } from "../constants/theme";

const OTP_LENGTH = 4;

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function OtpInput({ value, onChange, disabled = false }: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = value.padEnd(OTP_LENGTH, " ").slice(0, OTP_LENGTH).split("");

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        className="flex-row justify-center gap-3"
        disabled={disabled}
        onPress={() => inputRef.current?.focus()}
      >
        {digits.map((digit, index) => (
          <View
            key={index}
            className="h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white"
            style={
              digit.trim()
                ? { borderColor: theme.ctaPrimary, backgroundColor: theme.feedback.info.bg }
                : undefined
            }
          >
            <Text className="font-poppins-bold text-2xl text-slate-900">
              {digit.trim()}
            </Text>
          </View>
        ))}
      </Pressable>
      <TextInput
        ref={inputRef}
        autoComplete="one-time-code"
        editable={!disabled}
        keyboardType="number-pad"
        maxLength={OTP_LENGTH}
        style={{ height: 0, width: 0, opacity: 0 }}
        textContentType="oneTimeCode"
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, OTP_LENGTH))}
      />
    </View>
  );
}
