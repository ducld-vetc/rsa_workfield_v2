/** Ảnh mock cục bộ — JPEG thật, không phụ thuộc CDN. */
const BASE = '/mock-photos';

const PHOTOS = {
  'scene-1': `${BASE}/car-road-1.jpg`,
  'scene-2': `${BASE}/car-parked-1.jpg`,
  'scene-3': `${BASE}/car-detail-1.jpg`,
  'process-1': `${BASE}/car-repair-1.jpg`,
  'process-2': `${BASE}/tow-1.jpg`,
  'complete-1': `${BASE}/car-highway-1.jpg`,
  'quote-a': `${BASE}/car-road-1.jpg`,
  'quote-b': `${BASE}/car-parked-1.jpg`,
  'quote-c': `${BASE}/car-detail-1.jpg`,
  'quote-d': `${BASE}/car-repair-1.jpg`,
  'quote-e': `${BASE}/tow-1.jpg`,
  'quote-f': `${BASE}/car-night-1.jpg`,
} as const;

export type MockPhotoKey = keyof typeof PHOTOS;

export function mockPhotoUrl(key: MockPhotoKey): string {
  return PHOTOS[key];
}

export { PHOTOS as MOCK_PHOTO_ASSETS };
