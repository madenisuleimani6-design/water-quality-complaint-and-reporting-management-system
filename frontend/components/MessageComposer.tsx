import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { theme } from "../constants/theme";
import { AlertBanner } from "./AlertBanner";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MessageComposerProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  sending: boolean;
  profileComplete: boolean;
  error?: string | null;
};

export function MessageComposer({
  value,
  onChangeText,
  onSend,
  sending,
  profileComplete,
  error,
}: MessageComposerProps) {
  const { t } = useTranslation();
  const scale = useSharedValue(1);
  const canSend = profileComplete && value.trim().length > 0 && !sending;

  const sendAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleSend = () => {
    if (!canSend) {
      return;
    }
    onSend();
    Keyboard.dismiss();
  };

  const inputRow = (
    <View className="flex-row items-end gap-2">
      <TextInput
        accessibilityLabel={t("messages.placeholder")}
        autoCapitalize="sentences"
        autoCorrect
        blurOnSubmit={false}
        className="min-h-[48px] flex-1 rounded-2xl border border-slate-200 bg-dawasa-surface px-4 py-3 font-poppins text-base text-slate-900"
        editable={profileComplete && !sending}
        enablesReturnKeyAutomatically
        keyboardType="default"
        multiline
        placeholder={t("messages.placeholder")}
        placeholderTextColor={theme.placeholder}
        returnKeyType="default"
        scrollEnabled
        style={{ maxHeight: 120 }}
        submitBehavior="newline"
        textAlignVertical="top"
        value={value}
        onChangeText={onChangeText}
      />
      <AnimatedPressable
        accessibilityLabel={t("messages.send")}
        accessibilityRole="button"
        className="mb-1 h-12 w-12 items-center justify-center rounded-full"
        disabled={!canSend}
        style={[
          sendAnimatedStyle,
          {
            backgroundColor: canSend ? theme.ctaPrimary : theme.border,
          },
        ]}
        onPress={handleSend}
        onPressIn={() => {
          if (canSend) {
            scale.value = withSpring(0.92, { damping: 12, stiffness: 280 });
          }
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 280 });
        }}
      >
        {sending ? (
          <ActivityIndicator color={theme.textOnPrimary} size="small" />
        ) : (
          <MaterialIcons
            color={canSend ? theme.textOnPrimary : theme.placeholder}
            name="send"
            size={22}
          />
        )}
      </AnimatedPressable>
    </View>
  );

  return (
    <View
      className="border-t border-slate-200 bg-white px-4 pb-3 pt-3"
      style={theme.shadow.composer}
    >
      {!profileComplete ? (
        <AlertBanner
          dashed
          message={t("messages.profileRequired")}
          variant="warning"
        />
      ) : null}
      {error === "send_failed" ? (
        <AlertBanner message={t("messages.sendError")} variant="error" />
      ) : null}
      {inputRow}
    </View>
  );
}
