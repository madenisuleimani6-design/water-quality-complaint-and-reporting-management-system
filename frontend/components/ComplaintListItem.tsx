import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image, Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { theme } from "../constants/theme";
import { ComplaintSummary } from "../types/citizen";

type ComplaintListItemProps = {
  complaint: ComplaintSummary;
  onPress: () => void;
};

const THUMB_SIZE = 84;

function formatListDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function ComplaintListItem({ complaint, onPress }: ComplaintListItemProps) {
  const { t, i18n } = useTranslation();
  const area = complaint.areaName || t("confirm.locationUnavailable");
  const date = formatListDate(complaint.submittedAt, i18n.language);
  const note = complaint.note?.trim();

  return (
    <Pressable
      accessibilityHint={t("home.cardHint")}
      accessibilityLabel={`${area}, ${t("home.submittedLabel")} ${date}`}
      accessibilityRole="button"
      className="mb-4"
      onPress={onPress}
      style={({ pressed }) => [
        theme.shadow.cardSubtle,
        {
          opacity: pressed ? 0.94 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      <View
        className="flex-row overflow-hidden rounded-2xl border bg-white p-4"
        style={{ borderColor: theme.border }}
      >
        <View
          className="overflow-hidden rounded-xl bg-slate-100"
          style={{ height: THUMB_SIZE, width: THUMB_SIZE }}
        >
          {complaint.photoUrl ? (
            <Image
              accessibilityIgnoresInvertColors
              className="h-full w-full"
              resizeMode="cover"
              source={{ uri: complaint.photoUrl }}
            />
          ) : (
            <View className="h-full w-full items-center justify-center bg-slate-50">
              <MaterialIcons color={theme.border} name="image-not-supported" size={28} />
            </View>
          )}
        </View>

        <View
          className="ml-4 flex-1 justify-between"
          style={{ minHeight: THUMB_SIZE }}
        >
          <View>
            <View className="flex-row items-center gap-1.5">
              <MaterialIcons color={theme.ctaPrimary} name="place" size={15} />
              <Text
                className="flex-1 font-poppins-semibold text-[15px] leading-5 text-slate-900"
                numberOfLines={1}
              >
                {area}
              </Text>
            </View>

            <Text
              className={`mt-2 font-poppins text-sm leading-5 ${
                note ? "text-slate-600" : "text-slate-400 italic"
              }`}
              numberOfLines={2}
            >
              {note || t("home.noNote")}
            </Text>
          </View>

          <View className="mt-3 flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center gap-1">
              <MaterialIcons color={theme.tabInactive} name="event" size={13} />
              <Text className="font-poppins text-xs text-slate-400">
                {t("home.submittedLabel")} · {date}
              </Text>
            </View>
            <View
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.feedback.info.bg }}
            >
              <MaterialIcons color={theme.ctaPrimary} name="chevron-right" size={20} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
