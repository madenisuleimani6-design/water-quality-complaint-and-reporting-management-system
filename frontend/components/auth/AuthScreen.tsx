import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { FadeInView } from "../FadeInView";
import { ResponsiveShell } from "../ResponsiveShell";
import { theme } from "../../constants/theme";
import { useBottomSafeInset } from "../../hooks/useBottomSafeInset";
import { isWeb } from "../../utils/platform";

type AuthScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  hero?: ReactNode;
  showBack?: boolean;
  footer?: ReactNode;
  centerContent?: boolean;
  centerHeader?: boolean;
  headerExtra?: ReactNode;
};

export function AuthScreen({
  children,
  title,
  subtitle,
  hero,
  showBack = false,
  footer,
  centerContent = false,
  centerHeader = false,
  headerExtra,
}: AuthScreenProps) {
  const bottomInset = useBottomSafeInset();

  return (
    <ResponsiveShell
      safeAreaEdges={["top", "bottom", "left", "right"]}
      variant="light"
    >
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        enabled={Platform.OS !== "web"}
        style={{ backgroundColor: theme.surface }}
      >
        <View className="flex-1">
          {showBack ? (
            <View className="px-5 pt-2">
              <Pressable
                accessibilityLabel="Back"
                accessibilityRole="button"
                className="-ml-1 h-10 w-10 items-center justify-center rounded-full"
                hitSlop={8}
                onPress={() => router.back()}
                style={{ backgroundColor: theme.card, ...theme.shadow.cardSubtle }}
              >
                <MaterialIcons color={theme.ctaDark} name="arrow-back" size={22} />
              </Pressable>
            </View>
          ) : null}

          <ScrollView
            className="flex-1"
            contentContainerClassName={`flex-grow px-5 pb-4 ${centerContent ? "justify-center" : ""}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {hero}

            {headerExtra ? (
              <View className={centerHeader ? "items-center" : ""}>{headerExtra}</View>
            ) : null}

            {title ? (
              <FadeInView delay={hero ? 80 : 0}>
                <Text
                  className={`font-poppins-bold text-[28px] leading-9 text-slate-900 ${centerHeader ? "text-center" : ""}`}
                  style={{ letterSpacing: -0.5 }}
                >
                  {title}
                </Text>
              </FadeInView>
            ) : null}

            {subtitle ? (
              <FadeInView delay={hero ? 120 : 40}>
                <Text
                  className={`mt-2 font-poppins text-base leading-6 text-slate-500 ${centerHeader ? "text-center" : ""}`}
                >
                  {subtitle}
                </Text>
              </FadeInView>
            ) : null}

            <FadeInView
              className={`gap-4 ${title || subtitle ? "mt-8" : ""}`}
              delay={hero ? 160 : 80}
            >
              {children}
            </FadeInView>
          </ScrollView>

          {footer ? (
            <View
              className="px-5 pt-3"
              style={{
                paddingBottom: Math.max(bottomInset, isWeb ? 20 : 8),
                backgroundColor: theme.surface,
                ...(isWeb
                  ? {}
                  : { borderTopWidth: 1, borderTopColor: "#f1f5f9" }),
              }}
            >
              <View className="w-full">{footer}</View>
            </View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </ResponsiveShell>
  );
}
