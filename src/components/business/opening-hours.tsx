import { getTranslations } from "next-intl/server";

import { formatTime, getUniformDailyHours, type OpeningInterval } from "@/lib/utils/hours";

/** Opening hours from the database; collapses to "Every day" when uniform. */
export async function OpeningHours({ hours }: { hours: OpeningInterval[] }) {
  const t = await getTranslations();
  if (hours.length === 0) return null;

  const uniform = getUniformDailyHours(hours);
  if (uniform) {
    return (
      <p>
        {t("common.everyDay")},{" "}
        <time dateTime={formatTime(uniform.opensAt)}>{formatTime(uniform.opensAt)}</time>
        {" – "}
        <time dateTime={formatTime(uniform.closesAt)}>{formatTime(uniform.closesAt)}</time>
      </p>
    );
  }

  const dayKeys = ["1", "2", "3", "4", "5", "6", "7"] as const;

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
      {dayKeys.map((day) => {
        const intervals = hours.filter((h) => String(h.dayOfWeek) === day && !h.isClosed);
        return (
          <div key={day} className="contents">
            <dt className="font-medium">{t(`days.${day}`)}</dt>
            <dd>
              {intervals.length === 0
                ? t("common.closed")
                : intervals
                    .map((h) => `${formatTime(h.opensAt!)} – ${formatTime(h.closesAt!)}`)
                    .join(", ")}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
