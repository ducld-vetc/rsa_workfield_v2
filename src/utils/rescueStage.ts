import { JobStage, RescuePhotoSet } from '../types';

const PENDING_RATING_KEY = 'rsa-pending-rating';

export interface StageAction {
  label: string;
  next?: JobStage;
  /** Mở màn chụp ngay sau khi chuyển stage */
  photoSet?: RescuePhotoSet;
  needsCompleteSheet?: boolean;
}

export function getStageAction(stage: JobStage, hasTow: boolean): StageAction {
  switch (stage) {
    case 'cho-nhan':
      return { label: 'Nhận đơn', next: 'da-nhan' };
    case 'da-nhan':
      return { label: 'Bắt đầu di chuyển', next: 'dang-di-chuyen' };
    case 'dang-di-chuyen':
      return { label: 'Đã đến điểm cứu hộ', next: 'da-den-diem', photoSet: 'A' };
    case 'da-den-diem':
      return hasTow
        ? { label: 'Bắt đầu kéo xe', next: 'dang-keo' }
        : { label: 'Hoàn thành cứu hộ', needsCompleteSheet: true };
    case 'dang-keo':
      return { label: 'Đã kéo xe tới điểm', next: 'da-keo-toi' };
    case 'da-keo-toi':
      return { label: 'Hoàn thành cứu hộ', needsCompleteSheet: true };
    case 'hoan-thanh':
      return { label: 'Hoàn thành' };
  }
}

export function suggestedPhotoSet(stage: JobStage): RescuePhotoSet {
  if (stage === 'da-keo-toi' || stage === 'hoan-thanh') return 'C';
  if (stage === 'dang-keo') return 'B';
  return 'A';
}

export function rescueCameraPath(orderId: string, set: RescuePhotoSet, capture = false): string {
  return `/jobs/${orderId}/camera?set=${set}${capture ? '&capture=1' : ''}`;
}

export function markPendingRating(): void {
  sessionStorage.setItem(PENDING_RATING_KEY, '1');
}

export function hasPendingRating(): boolean {
  return sessionStorage.getItem(PENDING_RATING_KEY) === '1';
}

export function consumePendingRating(): boolean {
  if (!hasPendingRating()) return false;
  sessionStorage.removeItem(PENDING_RATING_KEY);
  return true;
}
