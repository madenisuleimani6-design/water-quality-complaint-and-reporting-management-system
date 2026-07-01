import { Calendar, ChevronRight, ImageOff, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

import { theme } from "@/constants/theme";
import type { ComplaintSummary } from "@/types/citizen";

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
    <button
      type="button"
      aria-label={`${area}, ${t("home.submittedLabel")} ${date}`}
      onClick={onPress}
      className="mb-4 w-full text-left transition active:scale-[0.985] active:opacity-95"
      style={{ boxShadow: theme.shadow.cardSubtle }}
    >
      <div
        className="flex overflow-hidden rounded-2xl border bg-white p-4"
        style={{ borderColor: theme.border }}
      >
        <div
          className="shrink-0 overflow-hidden rounded-xl bg-slate-100"
          style={{ height: THUMB_SIZE, width: THUMB_SIZE }}
        >
          {complaint.photoUrl ? (
            <img
              src={complaint.photoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-50">
              <ImageOff className="h-7 w-7" style={{ color: theme.border }} />
            </div>
          )}
        </div>

        <div
          className="ml-4 flex min-h-[84px] flex-1 flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-[15px] w-[15px] shrink-0" style={{ color: theme.ctaPrimary }} />
              <p className="line-clamp-1 flex-1 font-poppins-semibold text-[15px] leading-5 text-slate-900">
                {area}
              </p>
            </div>
            <p
              className={`mt-2 line-clamp-2 font-poppins text-sm leading-5 ${
                note ? "text-slate-600" : "italic text-slate-400"
              }`}
            >
              {note || t("home.noNote")}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-1">
              <Calendar className="h-[13px] w-[13px]" style={{ color: theme.tabInactive }} />
              <span className="font-poppins text-xs text-slate-400">
                {t("home.submittedLabel")} · {date}
              </span>
            </div>
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: theme.feedback.info.bg }}
            >
              <ChevronRight className="h-5 w-5" style={{ color: theme.ctaPrimary }} />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
