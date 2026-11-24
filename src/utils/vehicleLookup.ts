import { listDriverVehicles, vehicleAlerts, DriverVehicle } from '../data/driverVehicles';
import { GeoPoint, RescueOrder } from '../types';

const HOANG_MAI: GeoPoint = { lat: 20.9752, lng: 105.8548 };

/** Điểm đỗ demo, quanh trạm của xe. Chưa có GPS thật. */
const PARK_POINTS: Record<string, GeoPoint> = {
  v1: { lat: 20.9761, lng: 105.8562 },
  v2: { lat: 20.9738, lng: 105.8524 },
  v3: { lat: 20.9698, lng: 105.7764 },
  v4: { lat: 20.9784, lng: 105.8581 },
  v5: { lat: 20.9648, lng: 105.7702 },
  v6: { lat: 20.9716, lng: 105.8496 },
  v7: { lat: 20.9822, lng: 105.7924 },
  v8: { lat: 20.9694, lng: 105.8488 },
  v9: { lat: 20.9248, lng: 105.8612 },
  v10: { lat: 20.9662, lng: 105.7818 },
};

export const LOOKUP_CENTER_PRESET: { label: string; point: GeoPoint } = {
  label: 'Trạm Hoàng Mai',
  point: HOANG_MAI,
};

export const RADIUS_OPTIONS = [5, 10, 20, 30];

export interface VehicleLookupQuery {
  from: number;
  to: number;
  radiusKm: number;
  center: GeoPoint;
  centerLabel: string;
}

export interface FreeVehicleHit {
  vehicle: DriverVehicle;
  distanceKm: number;
}

function plateKey(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function parseOrderTime(timestamp: string): number | null {
  const match = timestamp.match(
    /(\d{1,2}):(\d{2})(?::(\d{2}))?[,\s]+(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  );
  if (!match) return null;
  const [, hh, mm, ss, dd, mo, yyyy] = match;
  return new Date(
    Number(yyyy),
    Number(mo) - 1,
    Number(dd),
    Number(hh),
    Number(mm),
    Number(ss ?? 0),
  ).getTime();
}

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const lat1 = a.lat * rad;
  const lat2 = b.lat * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function busyWindows(orders: RescueOrder[]): { plate: string; from: number; to: number }[] {
  const windows: { plate: string; from: number; to: number }[] = [];
  orders.forEach((order) => {
    if (order.status !== 'cho-nhan' && order.status !== 'dang-cuu-ho') return;
    if (!order.delegatedVehiclePlate) return;
    const from = parseOrderTime(order.timestamp);
    if (from == null) return;
    windows.push({
      plate: plateKey(order.delegatedVehiclePlate),
      from,
      to: from + 6 * 60 * 60 * 1000,
    });
  });
  return windows;
}

function isBlocked(vehicle: DriverVehicle): boolean {
  return vehicleAlerts(vehicle).some((alert) => alert.level === 'hard');
}

export function findFreeVehicles(query: VehicleLookupQuery, orders: RescueOrder[]): FreeVehicleHit[] {
  const windows = busyWindows(orders);
  const hits: FreeVehicleHit[] = [];
  listDriverVehicles().forEach((vehicle) => {
    if (vehicle.status !== 'READY') return;
    if (isBlocked(vehicle)) return;
    const park = PARK_POINTS[vehicle.id];
    if (!park) return;
    const key = plateKey(vehicle.plate);
    const busy = windows.some(
      (window) => window.plate === key && window.from < query.to && window.to > query.from,
    );
    if (busy) return;
    const distanceKm = haversineKm(park, query.center);
    if (distanceKm > query.radiusKm) return;
    hits.push({ vehicle, distanceKm });
  });
  hits.sort((a, b) => a.distanceKm - b.distanceKm);
  return hits;
}

export function formatLookupWhen(value: number): string {
  const date = new Date(value);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  return `${hh}:${mm} ${dd}/${mo}/${date.getFullYear()}`;
}

export function toDateTimeLocal(value: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export function defaultLookupRange(): { from: string; to: string } {
  return {
    from: toDateTimeLocal(new Date(2025, 1, 15, 10, 0)),
    to: toDateTimeLocal(new Date(2025, 1, 15, 12, 0)),
  };
}
