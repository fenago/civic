import type { PollingLocation, VoterInfo } from "../../shared/civic";
import { hasCoords, milesBetween, type LatLng } from "./geo";

export type LocationType = "election" | "early" | "dropoff";
export const LOCATION_TYPES: LocationType[] = ["election", "early", "dropoff"];

export interface TypedLocation extends PollingLocation {
  type: LocationType;
  id: string;
  miles?: number;
}

export function allLocations(data: VoterInfo): TypedLocation[] {
  const tag = (list: PollingLocation[] | undefined, type: LocationType) =>
    (list ?? []).map((l, i) => ({ ...l, type, id: `${type}-${i}` }));
  return [
    ...tag(data.pollingLocations, "election"),
    ...tag(data.earlyVoteSites, "early"),
    ...tag(data.dropOffLocations, "dropoff"),
  ];
}

/**
 * Where distances are measured from. Google doesn't return coordinates for the voter's address,
 * so we use the browser location if the voter shared it, else their single assigned polling place.
 */
export function distanceOrigin(data: VoterInfo, here: LatLng | null): { origin: LatLng; from: "here" | "polling" } | null {
  if (here) return { origin: here, from: "here" };
  const assigned = data.pollingLocations ?? [];
  if (assigned.length === 1 && hasCoords(assigned[0])) {
    return { origin: { lat: assigned[0].latitude, lng: assigned[0].longitude }, from: "polling" };
  }
  return null;
}

export function withDistances(list: TypedLocation[], origin: LatLng | null): TypedLocation[] {
  if (!origin) return list;
  const measured = list.map((l) =>
    hasCoords(l) ? { ...l, miles: milesBetween(origin, { lat: l.latitude, lng: l.longitude }) } : l,
  );
  return measured.sort((a, b) => (a.miles ?? Infinity) - (b.miles ?? Infinity));
}

export function directionsUrl(l: PollingLocation, fallbackAddress: string): string {
  const destination = hasCoords(l) ? `${l.latitude},${l.longitude}` : fallbackAddress;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
