import { Text, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ComplaintStatus } from "../hooks/useComplaintStatus";

const STATUS_ORDER: ComplaintStatus[] = [
  "new",
  "assigned",
  "investigating",
  "resolved",
];

const STATUS_COLORS: Record<ComplaintStatus, string> = {
  new: "bg-red-500",
  assigned: "bg-yellow-500",
  investigating: "bg-blue-500",
  resolved: "bg-green-500",
};

type StatusTrackerProps = {
  status: ComplaintStatus;
};

export function StatusTracker({ status }: StatusTrackerProps) {
  const { t } = useTranslation();
  const activeIndex = STATUS_ORDER.indexOf(status);

  return (
    <View className="w-full gap-3">
      {STATUS_ORDER.map((item, index) => {
        const isActive = index <= activeIndex;
        return (
          <View key={item} className="flex-row items-center gap-3">
            <View
              className={`h-3 w-3 rounded-full ${
                isActive ? STATUS_COLORS[item] : "bg-slate-300"
              }`}
            />
            <Text
              className={`font-poppins text-sm ${
                isActive ? "font-poppins-semibold text-slate-900" : "text-slate-400"
              }`}
            >
              {t(`submitted.status.${item}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
