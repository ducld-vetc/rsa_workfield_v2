import { DriverRole } from '../types';

const STORAGE_KEY = 'rsa-driver-onboarding-done';

export type OnboardingStepId = 'quote' | 'accept' | 'operate' | 'track';

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  /** Một dòng ngắn — ưu tiên hình minh hoạ */
  caption: string;
}

const STEP_QUOTE: OnboardingStep = {
  id: 'quote',
  title: 'Báo giá đơn',
  caption: 'Chọn đơn → nhập giá & ETA → gửi.',
};

const STEP_ACCEPT: OnboardingStep = {
  id: 'accept',
  title: 'Nhận cuốc',
  caption: 'Bật sẵn sàng → khi có đơn → nhấn Nhận.',
};

const STEP_OPERATE: OnboardingStep = {
  id: 'operate',
  title: 'Vận hành cuốc',
  caption: 'Cập nhật từng bước trên màn Cứu hộ.',
};

const STEP_TRACK: OnboardingStep = {
  id: 'track',
  title: 'Theo dõi đơn',
  caption: 'Sau báo giá, xem kết quả ở Hoạt động.',
};

export function getOnboardingSteps(role: DriverRole): OnboardingStep[] {
  if (role === 'quote-only') {
    return [STEP_QUOTE, STEP_TRACK];
  }
  if (role === 'rescue-only') {
    return [STEP_ACCEPT, STEP_OPERATE];
  }
  return [STEP_QUOTE, STEP_ACCEPT, STEP_OPERATE];
}

export function isOnboardingDone(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOnboardingDone(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function resetOnboardingDone(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
