import { useId, useState } from "react";
import { currentPosition, reverseGeocode, type LatLng } from "../lib/geo";
import { t } from "../strings";

export function AddressForm({
  initial,
  onSubmit,
  busy,
}: {
  initial: string;
  onSubmit: (address: string, coords: LatLng | null) => void;
  busy: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);
  const [empty, setEmpty] = useState(false);
  const id = useId();

  const useLocation = async () => {
    setLocating(true);
    setLocError(false);
    try {
      const pos = await currentPosition();
      const address = await reverseGeocode(pos);
      if (!address) throw new Error("no address");
      setValue(address);
      setCoords(pos);
    } catch {
      setLocError(true);
    } finally {
      setLocating(false);
    }
  };

  return (
    <section className="card space-y-4" aria-labelledby={`${id}-title`}>
      <div>
        <h1 id={`${id}-title`} tabIndex={-1} className="text-2xl font-bold sm:text-3xl">
          {t.tagline}
        </h1>
      </div>
      <form
        className="space-y-3"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const address = value.trim();
          if (!address) {
            setEmpty(true);
            return;
          }
          onSubmit(address, coords);
        }}
      >
        <div>
          <label htmlFor={`${id}-address`} className="block font-semibold">
            {t.address.label}
          </label>
          <p id={`${id}-hint`} className="mb-2 text-sm text-slate-700">
            {t.address.hint}
          </p>
          <input
            id={`${id}-address`}
            name="street-address"
            type="text"
            inputMode="text"
            autoComplete="street-address"
            className="field"
            placeholder={t.address.placeholder}
            value={value}
            maxLength={200}
            aria-describedby={`${id}-hint${empty ? ` ${id}-empty` : ""}`}
            aria-invalid={empty || undefined}
            onChange={(e) => {
              setValue(e.target.value);
              setEmpty(false);
              setCoords(null);
            }}
          />
          {empty && (
            <p id={`${id}-empty`} className="mt-1 text-sm font-medium text-red-700">
              {t.status.noAddressParameter}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className="btn-primary sm:flex-1" disabled={busy}>
            {busy ? t.address.loading : t.address.submit}
          </button>
          <button type="button" className="btn-secondary" onClick={useLocation} disabled={locating}>
            {locating ? t.address.locating : t.address.useLocation}
          </button>
        </div>
        <div aria-live="polite" className="text-sm">
          {locError && <p className="font-medium text-red-700">{t.address.locationError}</p>}
        </div>
        <p className="text-sm text-slate-700">{t.address.privacyNote}</p>
        <p className="text-xs text-slate-600">{t.address.locationNote}</p>
      </form>
    </section>
  );
}
