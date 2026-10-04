import { businessDefaults } from "@/config/business-defaults";

export type Directions = {
  url: string;
  /** True when the link targets a nearby landmark rather than the exact shop. */
  isApproximate: boolean;
};

type Location = {
  googleMapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
};

/**
 * Best available directions link, without inventing coordinates:
 *   1. the Google Maps link saved by the business, else
 *   2. exact coordinates saved by the business, else
 *   3. a map search for the confirmed landmark the shop is next to.
 */
export function getDirections(location: Location): Directions {
  if (location.googleMapsUrl) return { url: location.googleMapsUrl, isApproximate: false };

  if (location.latitude != null && location.longitude != null) {
    return {
      url: `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`,
      isApproximate: false,
    };
  }

  return {
    url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessDefaults.landmarkSearchQuery)}`,
    isApproximate: true,
  };
}
