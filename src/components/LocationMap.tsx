import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { hasCoords, type LatLng } from "../lib/geo";
import type { LocationType, TypedLocation } from "../lib/locations";
import { tidy } from "../lib/format";
import { t } from "../strings";

const LETTER: Record<LocationType | "you", string> = { election: "E", early: "V", dropoff: "D", you: "•" };

const icon = (type: LocationType | "you") =>
  L.divIcon({
    className: "",
    html: `<span class="marker-pin marker-${type}" aria-hidden="true">${LETTER[type]}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) map.setView(points[0], 15);
    else if (points.length > 1) map.fitBounds(points, { padding: [24, 24], maxZoom: 15 });
  }, [map, points]);
  return null;
}

export default function LocationMap({ locations, here }: { locations: TypedLocation[]; here: LatLng | null }) {
  const mapped = useMemo(
    () => locations.filter(hasCoords) as (TypedLocation & { latitude: number; longitude: number })[],
    [locations],
  );
  // Fit to the nearest locations when sorted by distance, so the map opens on the voter's area.
  const points = useMemo<[number, number][]>(() => {
    const near = mapped.some((l) => l.miles !== undefined) ? mapped.slice(0, 5) : mapped;
    const pts = near.map((l) => [l.latitude, l.longitude] as [number, number]);
    if (here) pts.push([here.lat, here.lng]);
    return pts;
  }, [mapped, here]);

  if (!mapped.length) return null;
  const icons = { election: icon("election"), early: icon("early"), dropoff: icon("dropoff"), you: icon("you") };

  return (
    <div>
      <MapContainer
        center={points[0] ?? [39.8, -98.6]}
        zoom={12}
        scrollWheelZoom={false}
        className="h-72 w-full rounded-xl border border-slate-200 sm:h-96"
        aria-label={t.vote.mapLabel}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {here && <Marker position={[here.lat, here.lng]} icon={icons.you} />}
        {mapped.map((l) => (
          <Marker key={l.id} position={[l.latitude, l.longitude]} icon={icons[l.type]} title={tidy(l.address?.locationName || l.name)}>
            <Popup>
              <strong>{tidy(l.address?.locationName || l.name)}</strong>
              <br />
              {t.vote.types[l.type]}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm" aria-hidden="true">
        {(["election", "early", "dropoff"] as const).map((type) => (
          <li key={type} className="flex items-center gap-1.5">
            <span className={`marker-pin marker-${type}`} style={{ width: 20, height: 20, fontSize: 11 }}>
              {LETTER[type]}
            </span>
            {t.vote.types[type]}
          </li>
        ))}
      </ul>
    </div>
  );
}
