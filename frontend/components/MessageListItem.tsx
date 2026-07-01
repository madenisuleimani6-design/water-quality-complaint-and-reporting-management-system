import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { theme } from "../constants/theme";
import { CitizenMessage } from "../types/citizen";
import { Card } from "./Card";

type MessageListItemProps = {
  message: CitizenMessage;
};

const statusStyles: Record<
  CitizenMessage["status"],
  { bg: string; text: string; label: string }
> = {
  sent: {
    bg: theme.feedback.success.bg,
    text: theme.feedback.success.text,
    label: "statusSent",
  },
  pending: {
    bg: theme.feedback.warning.bg,
    text: theme.feedback.warning.text,
    label: "statusPending",
  },
  failed: {
    bg: theme.feedback.error.bg,
    text: theme.feedback.error.text,
    label: "statusFailed",
  },
};

function formatDateTime(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessageListItem({ message }: MessageListItemProps) {
  const { t, i18n } = useTranslation();
  const date = formatDateTime(message.sentAt, i18n.language);
  const style = statusStyles[message.status];
  const hasReply = Boolean(message.adminReply?.trim());

  return (
    <Card className="mb-3 p-4" subtle>
      <Text className="font-poppins-medium text-xs uppercase tracking-wide text-slate-400">
        {t("messages.you")}
      </Text>
      <Text className="mt-1 font-poppins text-base leading-6 text-slate-800">
        {message.body}
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="font-poppins text-xs text-slate-400">{date}</Text>
        <View
          className="rounded-full px-2.5 py-1"
          style={{ backgroundColor: style.bg }}
        >
          <Text
            className="font-poppins-medium text-xs"
            style={{ color: style.text }}
          >
            {t(`messages.${style.label}` as "messages.statusSent")}
          </Text>
        </View>
      </View>
      {hasReply ? (
        <View
          className="mt-4 rounded-2xl border px-3 py-3"
          style={{
            backgroundColor: theme.feedback.info.bg,
            borderColor: theme.feedback.info.border,
          }}
        >
          <Text
            className="font-poppins-medium text-xs uppercase tracking-wide"
            style={{ color: theme.feedback.info.text }}
          >
            {t("messages.dawasaReply")}
          </Text>
          <Text className="mt-1 font-poppins text-sm leading-6 text-slate-800">
            {message.adminReply}
          </Text>
          {message.adminRepliedAt ? (
            <Text className="mt-2 font-poppins text-xs text-slate-500">
              {formatDateTime(message.adminRepliedAt, i18n.language)}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
