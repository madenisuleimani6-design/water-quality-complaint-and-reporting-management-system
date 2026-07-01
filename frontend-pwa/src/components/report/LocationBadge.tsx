import { useTranslation } from "react-i18next";

type LocationBadgeProps = {
  areaName?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  loading?: boolean;
};

export function LocationBadge({
  areaName,
  latitude,
  longitude,
  loading,
}: LocationBadgeProps) {
  const { t } = useTranslation();

  let label = t("confirm.locationUnavailable");
  if (loading) label = "...";
  else if (areaName) label = areaName;
  else if (latitude && longitude) label = `${latitude}, ${longitude}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <p className="font-poppins text-sm text-slate-700">{label}</p>
    </div>
  );
}
