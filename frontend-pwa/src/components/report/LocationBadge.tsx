import { useTranslation } from "react-i18next";

import { formatCoordinateDisplay } from "@/utils/coordinates";

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

  const lat = formatCoordinateDisplay(latitude);
  const lng = formatCoordinateDisplay(longitude);
  const hasCoords = lat != null && lng != null;

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <p className="font-poppins text-sm text-slate-700">...</p>
      </div>
    );
  }

  if (!hasCoords && !areaName) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <p className="font-poppins text-sm text-slate-700">
          {t("confirm.locationUnavailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      {hasCoords ? (
        <>
          <p className="font-poppins-medium text-sm text-slate-800">
            {t("confirm.latitude")}: {lat}
          </p>
          <p className="mt-1 font-poppins-medium text-sm text-slate-800">
            {t("confirm.longitude")}: {lng}
          </p>
          {areaName ? (
            <p className="mt-2 font-poppins text-xs text-slate-500">{areaName}</p>
          ) : null}
        </>
      ) : (
        <p className="font-poppins text-sm text-slate-700">{areaName}</p>
      )}
    </div>
  );
}
