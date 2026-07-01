import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { theme } from "../constants/theme";
import { FadeInView } from "./FadeInView";
import { PrimaryPillButton } from "./PrimaryPillButton";
import { SectionTitle } from "./SectionTitle";

type EmptyHomeStateProps = {
  onReportPress: () => void;
  missingPhone?: boolean;
};

export function EmptyHomeState({ onReportPress, missingPhone }: EmptyHomeStateProps) {
  const { t } = useTranslation();

  return (
    <FadeInView className="flex-1 items-center justify-center pb-12">
      <View
        className="mb-6 h-24 w-24 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.feedback.info.bg }}
      >
        <MaterialIcons color={theme.ctaPrimary} name="water-drop" size={48} />
      </View>
      <SectionTitle
        subtitle={missingPhone ? t("home.emptyPhoneHint") : t("home.emptyHint")}
        title={t("home.emptyTitle")}
      />
      <View className="w-full">
        <PrimaryPillButton label={t("home.reportIssue")} onPress={onReportPress} />
      </View>
    </FadeInView>
  );
}
