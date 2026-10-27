export interface LatLng {
  lat: number;
  lng: number;
}

/** Great-circle distance in miles. */
export function milesBetween(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function hasCoords(p: { latitude?: number; longitude?: number }): p is { latitude: number; longitude: number } {
  return typeof p.latitude === "number" && typeof p.longitude === "number" && !(p.latitude === 0 && p.longitude === 0);
}

/**
 * Turn the browser's coordinates into an address via OpenStreetMap Nominatim.
 * Only runs when the voter taps "Use my location"; it only fills the address field.
 */
export async function reverseGeocode(pos: LatLng): Promise<string | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.search = new URLSearchParams({
    format: "jsonv2",
    lat: pos.lat.toFixed(6),
    lon: pos.lng.toFixed(6),
    addressdetails: "1",
    zoom: "18",
  }).toString();
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    address?: Record<string, string>;
  };
  const a = body.address;
  if (!a) return null;
  const street = [a.house_number, a.road].filter(Boolean).join(" ");
  const city = a.city || a.town || a.village || a.hamlet || a.suburb || "";
  const state = a["ISO3166-2-lvl4"]?.replace(/^US-/, "") || a.state || "";
  const parts = [street, city, [state, a.postcode].filter(Boolean).join(" ")].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function currentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("unsupported"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}
