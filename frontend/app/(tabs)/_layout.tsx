import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { TabBarButton } from "../../components/TabBarButton";
import { TAB_BAR_CONTENT_HEIGHT } from "../../constants/layout";
import { theme } from "../../constants/theme";
import { useBottomSafeInset } from "../../hooks/useBottomSafeInset";

function TabIcon({  name,
  color,
  focused,
}: {
  name: keyof typeof MaterialIcons.glyphMap;
  color: string;
  focused: boolean;
}) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        width: 48,
        height: 32,
        borderRadius: 16,
        backgroundColor: focused ? theme.feedback.info.bg : "transparent",
      }}
    >
      <MaterialIcons color={color} name={name} size={24} />
    </View>
  );
}

export default function TabLayout() {
  const { t } = useTranslation();
  const bottomInset = useBottomSafeInset();

  return (
    <Tabs
      screenOptions={{
        animation: "none",
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarLabelStyle: {
          fontFamily: "Poppins_500Medium",
          fontSize: 11,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingTop: 6,
          paddingBottom: bottomInset,
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={String(color)} focused={focused} name="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t("tabs.messages"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={String(color)}
              focused={focused}
              name="chat-bubble-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tabs.profile"),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon color={String(color)} focused={focused} name="person-outline" />
          ),
        }}
      />
    </Tabs>
  );
}
