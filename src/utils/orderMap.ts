import { GeoPoint, JobStage, RescueOrder } from '../types';

/** Tọa độ mẫu theo địa chỉ demo — production sẽ lấy từ geocode API */
export const ORDER_COORDS: Record<
  string,
  { pickup: GeoPoint; tow?: GeoPoint }
> = {
  '1': {
    pickup: { lat: 10.7821, lng: 106.6954 },
    tow: { lat: 10.7908, lng: 106.7182 },
  },
  '2': {
    pickup: { lat: 10.7769, lng: 106.7009 },
  },
  '3': {
    pickup: { lat: 21.0456, lng: 105.8772 },
    tow: { lat: 21.0285, lng: 105.8542 },
  },
  '4': {
    pickup: { lat: 20.8449, lng: 106.6881 },
  },
};

const DEFAULT_CENTER: GeoPoint = { lat: 21.0285, lng: 105.8542 };

export function getOrderPickup(order: RescueOrder): GeoPoint {
  return order.pickupCoords ?? ORDER_COORDS[order.id]?.pickup ?? DEFAULT_CENTER;
}

export function getOrderTow(order: RescueOrder): GeoPoint | undefined {
  return order.towCoords ?? ORDER_COORDS[order.id]?.tow;
}

function interpolate(from: GeoPoint, to: GeoPoint, t: number): GeoPoint {
  const clamped = Math.min(1, Math.max(0, t));
  return {
    lat: from.lat + (to.lat - from.lat) * clamped,
    lng: from.lng + (to.lng - from.lng) * clamped,
  };
}

function offsetFromPickup(pickup: GeoPoint, kmApprox = 2.5): GeoPoint {
  return {
    lat: pickup.lat - kmApprox * 0.009,
    lng: pickup.lng - kmApprox * 0.011,
  };
}

export function getDriverPosition(order: RescueOrder): GeoPoint {
  const pickup = getOrderPickup(order);
  const tow = getOrderTow(order);
  const progress = (order.travelProgress ?? 40) / 100;
  const stage: JobStage = order.jobStage ?? 'da-nhan';

  if (stage === 'da-den-diem') return pickup;
  if (stage === 'dang-keo' && tow) return interpolate(pickup, tow, progress);
  if (stage === 'hoan-thanh' && tow) return tow;

  const start = offsetFromPickup(pickup);
  return interpolate(start, pickup, progress);
}

export function getMapPoints(order: RescueOrder): {
  pickup: GeoPoint;
  tow?: GeoPoint;
  driver: GeoPoint;
} {
  return {
    pickup: getOrderPickup(order),
    tow: getOrderTow(order),
    driver: getDriverPosition(order),
  };
}

export function getRoutePolyline(order: RescueOrder): GeoPoint[] {
  const { pickup, tow, driver } = getMapPoints(order);
  const stage = order.jobStage ?? 'da-nhan';

  if (stage === 'dang-keo' && tow) {
    return [driver, tow];
  }
  if (stage === 'da-den-diem') {
    return tow ? [pickup, tow] : [pickup];
  }
  return [driver, pickup];
}

export const EMPTY_MAP_CENTER = DEFAULT_CENTER;
