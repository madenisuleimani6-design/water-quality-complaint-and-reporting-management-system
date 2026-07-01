import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

import { theme } from "../constants/theme";
import { FadeInView } from "./FadeInView";
import { SectionTitle } from "./SectionTitle";

export function EmptyMessagesState() {
  const { t } = useTranslation();

  return (
    <FadeInView className="flex-1 items-center justify-center px-4 py-16">
      <View
        className="mb-6 h-20 w-20 items-center justify-center rounded-full"
        style={{ backgroundColor: theme.feedback.info.bg }}
      >
        <MaterialIcons color={theme.ctaPrimary} name="chat-bubble-outline" size={40} />
      </View>
      <SectionTitle
        subtitle={t("messages.emptyHint")}
        title={t("messages.emptyTitle")}
      />
    </FadeInView>
  );
}
