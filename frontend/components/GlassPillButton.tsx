import { Pressable, Text } from "react-native";

type GlassPillButtonProps = {
  label: string;
  onPress: () => void;
  selected?: boolean;
  disabled?: boolean;
};

export function GlassPillButton({
  label,
  onPress,
  selected = false,
  disabled = false,
}: GlassPillButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`mb-3 rounded-full border border-dashed px-6 py-4 ${
        selected
          ? "border-white bg-white/30"
          : "border-white/60 bg-white/15"
      } ${disabled ? "opacity-50" : ""}`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text
        className={`text-center font-poppins-medium text-base ${
          selected ? "text-white" : "text-white/90"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
