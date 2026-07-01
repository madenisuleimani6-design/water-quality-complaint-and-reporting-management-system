import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { gradientColors, theme } from "../constants/theme";

type HomeStatsBarProps = {
  totalReports: number;
};

export function HomeStatsBar({ totalReports }: HomeStatsBarProps) {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[...gradientColors]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={{
        borderRadius: 16,
        marginBottom: 16,
        ...theme.shadow.card,
      }}
    >
      <View className="flex-row items-center gap-3 px-4 py-4">
        <View
          className="h-11 w-11 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(255,255,255,0.22)" }}
        >
          <MaterialIcons color={theme.textOnPrimary} name="assignment" size={22} />
        </View>
        <View className="flex-1">
          <Text className="font-poppins-semibold text-base text-white">
            {t(
              totalReports === 1 ? "home.statsTitleOne" : "home.statsTitleMany",
              { count: totalReports },
            )}
          </Text>
          <Text
            className="mt-0.5 font-poppins text-xs leading-5"
            style={{ color: theme.textMutedOnPrimary }}
          >
            {t("home.statsHint")}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}