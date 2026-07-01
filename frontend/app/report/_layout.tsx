import { Stack } from "expo-router";

import { ReportPhotoProvider } from "../../contexts/ReportPhotoContext";

export default function ReportLayout() {
  return (
    <ReportPhotoProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="confirm" />
        <Stack.Screen name="submitted" />
      </Stack>
    </ReportPhotoProvider>
  );
}
