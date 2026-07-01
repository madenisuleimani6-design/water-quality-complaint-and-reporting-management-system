import "react-native-gesture-handler";
import "react-native-reanimated";

import "../global.css";
import "../i18n";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

import { NavigationGuard } from "../components/NavigationGuard";
import { WebSplashScreen } from "../components/WebSplashScreen";
import { ProfileProvider } from "../contexts/ProfileContext";
import i18n from "../i18n";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { isWeb } from "../utils/platform";

SplashScreen.preventAutoHideAsync();

function AppProviders({ children }: { children: ReactNode }) {
  useOfflineSync();
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require("../assets/fonts/Poppins_400Regular.ttf"),
    Poppins_500Medium: require("../assets/fonts/Poppins_500Medium.ttf"),
    Poppins_600SemiBold: require("../assets/fonts/Poppins_600SemiBold.ttf"),
    Poppins_700Bold: require("../assets/fonts/Poppins_700Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return isWeb ? <WebSplashScreen /> : null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <KeyboardProvider>
          <BottomSheetModalProvider>
            <I18nextProvider i18n={i18n}>
              <ProfileProvider>
                <AppProviders>
                  <NavigationGuard>
                    <StatusBar style="dark" />
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(auth)" />
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen
                        name="complaint/[id]"
                        options={{ animation: "slide_from_right" }}
                      />
                      <Stack.Screen
                        name="report"
                        options={{
                          presentation: "modal",
                          animation: "slide_from_bottom",
                        }}
                      />
                    </Stack>
                  </NavigationGuard>
                </AppProviders>
              </ProfileProvider>
            </I18nextProvider>
          </BottomSheetModalProvider>
        </KeyboardProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
