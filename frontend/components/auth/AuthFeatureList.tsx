import { ComponentProps } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text, View } from "react-native";

import { theme } from "../../constants/theme";

type AuthFeature = {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  label: string;
};

type AuthFeatureListProps = {
  features: AuthFeature[];
};

export function AuthFeatureList({ features }: AuthFeatureListProps) {
  return (
    <View className="mt-8 gap-3">
      {features.map((feature) => (
        <View
          key={feature.label}
          className="flex-row items-center gap-3 rounded-2xl px-4 py-3.5"
          style={{ backgroundColor: theme.card, ...theme.shadow.cardSubtle }}
        >
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: theme.feedback.info.bg }}
          >
            <MaterialIcons color={theme.ctaPrimary} name={feature.icon} size={20} />
          </View>
          <Text className="flex-1 font-poppins-medium text-[15px] text-slate-700">
            {feature.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
