import Image from "next/image";
import { getTranslations } from "next-intl/server";

import type { LocationPhoto } from "@/server/location-photos";

/**
 * "How to find us": numbered photos (entrance, building, door…) with the
 * captions the family wrote. Swipe sideways on phones; a grid on wide screens.
 * Tapping a photo opens it full size.
 */
export async function LocationPhotos({
  photos,
  businessName,
}: {
  photos: LocationPhoto[];
  businessName: string;
}) {
  if (photos.length === 0) return null;
  const t = await getTranslations();

  return (
    <div className="mt-10">
      <h3 className="font-sans text-sm font-semibold tracking-wide text-gold-700 uppercase">
        {t("home.location.howToFind")}
      </h3>
      <ol className="-mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
        {photos.map((photo, index) => {
          const label =
            photo.caption ?? t("home.location.photoAlt", { number: index + 1, name: businessName });
          return (
            <li key={photo.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
              <figure className="overflow-hidden rounded-card border border-border bg-background shadow-card">
                <a
                  href={photo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[4/3] bg-leaf-50"
                >
                  <Image
                    src={photo.url}
                    alt={label}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 80vw"
                    className="object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute top-3 left-3 grid size-8 place-items-center rounded-full bg-leaf-900 text-sm font-bold text-white shadow"
                  >
                    {index + 1}
                  </span>
                  <span className="sr-only"> {t("common.opensInNewTab")}</span>
                </a>
                {photo.caption && (
                  <figcaption className="p-4 text-leaf-900">{photo.caption}</figcaption>
                )}
              </figure>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
