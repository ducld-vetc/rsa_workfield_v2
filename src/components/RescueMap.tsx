import React, { useEffect } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GeoPoint, RescueOrder } from '../types';
import {
  EMPTY_MAP_CENTER,
  getMapPoints,
  getOrderPickup,
  getOrderTow,
  getRoutePolyline,
} from '../utils/orderMap';

interface RescueMapProps {
  order?: RescueOrder;
  className?: string;
}

function toLatLng(p: GeoPoint): [number, number] {
  return [p.lat, p.lng];
}

function FitMapBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) {
      map.setView(toLatLng(EMPTY_MAP_CENTER), 12);
      return;
    }
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [56, 56], maxZoom: 15 });
  }, [map, points]);

  return null;
}

function makeIcon(html: string, className: string) {
  return L.divIcon({
    className: `rescue-map-icon ${className}`,
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -30],
  });
}

const driverIcon = makeIcon(
  '<span class="rescue-map-icon__driver"><span class="rescue-map-icon__driver-ring"></span></span>',
  'rescue-map-icon--driver',
);

const pickupIcon = makeIcon(
  '<span class="rescue-map-icon__pin rescue-map-icon__pin--pickup"></span>',
  'rescue-map-icon--pickup',
);

const towIcon = makeIcon(
  '<span class="rescue-map-icon__pin rescue-map-icon__pin--tow"></span>',
  'rescue-map-icon--tow',
);

const RescueMap: React.FC<RescueMapProps> = ({ order, className = '' }) => {
  const center = order ? getOrderPickup(order) : EMPTY_MAP_CENTER;
  const points = order ? getMapPoints(order) : null;
  const route = order ? getRoutePolyline(order) : [];
  const tow = order ? getOrderTow(order) : undefined;

  const boundsPoints: [number, number][] = React.useMemo(() => {
    if (!order) return [toLatLng(EMPTY_MAP_CENTER)];
    const p = getMapPoints(order);
    return [p.driver, p.pickup, ...(p.tow ? [p.tow] : [])].map(toLatLng);
  }, [order?.id, order?.travelProgress, order?.jobStage]);

  return (
    <div className={`rescue-map ${className}`.trim()}>
      <MapContainer
        center={toLatLng(center)}
        zoom={13}
        zoomControl={false}
        attributionControl={false}
        className="rescue-map__leaflet"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitMapBounds points={boundsPoints} />

        {points && (
          <>
            <Marker position={toLatLng(points.driver)} icon={driverIcon}>
              <Popup>Vị trí của bạn</Popup>
            </Marker>
            <Marker position={toLatLng(points.pickup)} icon={pickupIcon}>
              <Popup>
                <strong>Điểm cứu hộ</strong>
                <br />
                {order?.address}
              </Popup>
            </Marker>
            {tow && (
              <Marker position={toLatLng(tow)} icon={towIcon}>
                <Popup>
                  <strong>Điểm kéo đến</strong>
                  <br />
                  {order?.towDestination}
                </Popup>
              </Marker>
            )}
            {route.length >= 2 && (
              <Polyline
                positions={route.map(toLatLng)}
                pathOptions={{
                  color: '#25a55e',
                  weight: 5,
                  opacity: 0.85,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default RescueMap;
