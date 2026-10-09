import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { DlsSearchField } from '@dls/components';
import { GeoPoint } from '../types';
import { EMPTY_MAP_CENTER } from '../utils/orderMap';

interface StationMapPickerProps {
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
  className?: string;
  hint?: string;
  searchable?: boolean;
}

interface PlaceHit {
  label: string;
  point: GeoPoint;
}

function toLatLng(p: GeoPoint): [number, number] {
  return [p.lat, p.lng];
}

function MapClickHandler({ onPick }: { onPick: (point: GeoPoint) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });
  return null;
}

function Recenter({ point }: { point: GeoPoint }) {
  const map = useMap();
  useEffect(() => {
    map.setView(toLatLng(point), map.getZoom(), { animate: true });
  }, [map, point.lat, point.lng]);
  return null;
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(timer);
  }, [map]);
  return null;
}

function FlyTo({ point, token }: { point: GeoPoint | null; token: number }) {
  const map = useMap();
  useEffect(() => {
    if (!point || token === 0) return;
    map.flyTo(toLatLng(point), 16, { animate: true });
  }, [map, point, token]);
  return null;
}

function parseCoords(raw: string): GeoPoint | null {
  const match = raw.trim().match(/(-?\d+(?:\.\d+)?)\s*[,;]\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;
  let lat = Number(match[1]);
  let lng = Number(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 && Math.abs(lng) <= 90) {
    [lat, lng] = [lng, lat];
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) };
}

async function searchPlaces(query: string): Promise<PlaceHit[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&accept-language=vi&countrycodes=vn`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('search');
  const data = (await response.json()) as { display_name?: string; lat?: string; lon?: string }[];
  return data.flatMap((item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
    return [{ label: item.display_name || `${lat}, ${lng}`, point: { lat, lng } }];
  });
}

const stationIcon = L.divIcon({
  className: 'rescue-map-icon grab-register-map__icon',
  html: '<span class="rescue-map-icon__pin rescue-map-icon__pin--pickup"></span>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const StationMapPicker: React.FC<StationMapPickerProps> = ({
  value,
  onChange,
  className = '',
  hint = 'Chạm trên bản đồ để chọn vị trí trạm',
  searchable = false,
}) => {
  const center = value ?? EMPTY_MAP_CENTER;
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<PlaceHit[]>([]);
  const [searchNote, setSearchNote] = useState('');
  const [searching, setSearching] = useState(false);
  const [flyPoint, setFlyPoint] = useState<GeoPoint | null>(null);
  const [flyToken, setFlyToken] = useState(0);
  const searchedHere =
    flyPoint != null && value != null && flyPoint.lat === value.lat && flyPoint.lng === value.lng;

  const focusPoint = (point: GeoPoint) => {
    onChange(point);
    setFlyPoint(point);
    setFlyToken((token) => token + 1);
    setHits([]);
    setSearchNote('');
  };

  const runSearch = async () => {
    const raw = query.trim();
    if (!raw || searching) return;
    const coords = parseCoords(raw);
    if (coords) {
      focusPoint(coords);
      return;
    }
    setSearching(true);
    setSearchNote('');
    setHits([]);
    try {
      const next = await searchPlaces(raw);
      if (next.length === 0) {
        setSearchNote('Không thấy địa chỉ. Thử tọa độ 10.77, 106.70');
      } else if (next.length === 1) {
        focusPoint(next[0].point);
      } else {
        setHits(next);
      }
    } catch {
      setSearchNote('Không tìm được. Kiểm tra mạng rồi thử lại.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={`grab-register-map ${className}`.trim()}>
      <MapContainer
        center={toLatLng(center)}
        zoom={14}
        zoomControl={false}
        attributionControl={false}
        className="grab-register-map__leaflet"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <InvalidateSize />
        <FlyTo point={flyPoint} token={flyToken} />
        <MapClickHandler onPick={onChange} />
        {value && !searchedHere && <Recenter point={value} />}
        {value && <Marker position={toLatLng(value)} icon={stationIcon} />}
      </MapContainer>
      {searchable && (
        <div className="grab-register-map__search">
          <DlsSearchField
            value={query}
            onChange={setQuery}
            onSubmit={() => {
              void runSearch();
            }}
            placeholder={searching ? 'Đang tìm...' : 'Địa chỉ hoặc tọa độ'}
            ariaLabel="Tìm vị trí"
          />
          {hits.length > 0 && (
            <div className="grab-register-map__results" role="listbox" aria-label="Kết quả tìm vị trí">
              {hits.map((hit) => (
                <button
                  key={`${hit.point.lat}-${hit.point.lng}-${hit.label}`}
                  type="button"
                  className="grab-register-map__result"
                  role="option"
                  onClick={() => focusPoint(hit.point)}
                >
                  {hit.label}
                </button>
              ))}
            </div>
          )}
          {searchNote && <p className="grab-register-map__note">{searchNote}</p>}
        </div>
      )}
      <div className="grab-register-map__hint" aria-hidden>
        {hint}
      </div>
    </div>
  );
};

export default StationMapPicker;
