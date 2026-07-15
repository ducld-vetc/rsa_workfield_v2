import React, { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { GeoPoint } from '../types';
import { EMPTY_MAP_CENTER } from '../utils/orderMap';

interface StationMapPickerProps {
  value: GeoPoint | null;
  onChange: (point: GeoPoint) => void;
  className?: string;
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
}) => {
  const center = value ?? EMPTY_MAP_CENTER;

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
        <MapClickHandler onPick={onChange} />
        {value && (
          <>
            <Recenter point={value} />
            <Marker position={toLatLng(value)} icon={stationIcon} />
          </>
        )}
      </MapContainer>
      <div className="grab-register-map__hint" aria-hidden>
        Chạm trên bản đồ để chọn vị trí trạm
      </div>
    </div>
  );
};

export default StationMapPicker;
