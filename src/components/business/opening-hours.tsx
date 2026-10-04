import { getLocale, getTranslations } from "next-intl/server";

import { localeMeta, type AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils/cn";
import {
  formatTime,
  formatTimeForLocale,
  getUniformDailyHours,
  type OpeningInterval,
} from "@/lib/utils/hours";

type OpeningHoursProps = {
  hours: OpeningInterval[];
  /** "inline": one line; "stacked": day label above a larger time range. */
  variant?: "inline" | "stacked";
  className?: string;
};

/** Opening hours from the database; collapses to "Every day" when uniform. */
export async function OpeningHours({ hours, variant = "inline", className }: OpeningHoursProps) {
  const [t, locale] = await Promise.all([getTranslations(), getLocale() as Promise<AppLocale>]);
  if (hours.length === 0) return null;

  const { hour12 } = localeMeta[locale];
  const time = (value: string) => (
    <time dateTime={formatTime(value)}>{formatTimeForLocale(value, locale, hour12)}</time>
  );

  const uniform = getUniformDailyHours(hours);
  if (uniform) {
    return variant === "stacked" ? (
      <p className={className}>
        <span className="block">{t("common.everyDay")}</span>
        <span className="mt-1 block text-2xl font-semibold text-leaf-900">
          {time(uniform.opensAt)} – {time(uniform.closesAt)}
        </span>
      </p>
    ) : (
      <p className={className}>
        {t("common.everyDay")}, {time(uniform.opensAt)} – {time(uniform.closesAt)}
      </p>
    );
  }

  const dayKeys = ["1", "2", "3", "4", "5", "6", "7"] as const;

  return (
    <dl className={cn("grid grid-cols-[auto_1fr] gap-x-4 gap-y-1", className)}>
      {dayKeys.map((day) => {
        const intervals = hours.filter((h) => String(h.dayOfWeek) === day && !h.isClosed);
        return (
          <div key={day} className="contents">
            <dt className="font-medium">{t(`days.${day}`)}</dt>
            <dd>
              {intervals.length === 0
                ? t("common.closed")
                : intervals.map((h, i) => (
                    <span key={h.opensAt}>
                      {i > 0 && ", "}
                      {time(h.opensAt!)} – {time(h.closesAt!)}
                    </span>
                  ))}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
