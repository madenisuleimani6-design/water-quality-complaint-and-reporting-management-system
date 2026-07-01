import { ReactNode } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { useTranslation } from "react-i18next";

import { isWeb } from "../utils/platform";
import { SafeEdge, SafeScreen } from "./SafeScreen";

type ResponsiveShellProps = {
  children: ReactNode;
  variant?: "dark" | "light" | "success";
  safeAreaEdges?: SafeEdge[];
};

const variantClasses = {
  dark: "bg-slate-900",
  light: "bg-slate-50",
  success: "bg-emerald-50",
};

const nativeVariantClasses = {
  dark: "sm:my-4 sm:rounded-2xl sm:overflow-hidden md:px-4 lg:my-8 lg:shadow-lg",
  light: "sm:my-4 sm:rounded-2xl sm:overflow-hidden md:px-4 lg:my-8 lg:shadow-lg",
  success: "sm:my-4 sm:rounded-2xl sm:overflow-hidden md:px-4 lg:my-8 lg:shadow-lg",
};

function DesktopNotice() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();

  if (!isWeb || width < 768) {
    return null;
  }

  return (
    <View className="w-full items-center bg-slate-900 px-4 py-3">
      <Text className="max-w-md text-center font-poppins text-sm text-slate-300">
        {t("pwa.desktopNotice")}
      </Text>
    </View>
  );
}

export function ResponsiveShell({
  children,
  variant = "light",
  safeAreaEdges = ["left", "right"],
}: ResponsiveShellProps) {
  const innerClassName = isWeb
    ? "mx-auto w-full max-w-[480px] flex-1 min-h-dvh shadow-xl"
    : `mx-auto w-full flex-1 sm:max-w-[480px] ${nativeVariantClasses[variant]}`;

  const outerClassName = isWeb
    ? `flex-1 items-center bg-slate-900 min-h-dvh`
    : `flex-1 ${variantClasses[variant]}`;

  return (
    <View className={outerClassName}>
      {isWeb ? <DesktopNotice /> : null}
      <View
        className={isWeb ? `w-full max-w-[480px] flex-1 ${variantClasses[variant]}` : "flex-1"}
      >
        <SafeScreen className={innerClassName} edges={safeAreaEdges}>
          {children}
        </SafeScreen>
      </View>
    </View>
  );
}
