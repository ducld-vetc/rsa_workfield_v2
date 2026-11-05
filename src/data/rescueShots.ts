import {
  CaptureOverlayKind,
  RescuePhotoCategory,
  RescuePhotoSet,
  RescueShotDef,
  RescueShotId,
} from '../types';

export const RESCUE_SHOTS: RescueShotDef[] = [
  {
    id: 'A1',
    set: 'A',
    label: 'Toàn cảnh hiện trường có xe khách hàng',
    guide: 'Lùi ra xa. Đưa cả xe khách và cảnh xung quanh vào khung.',
    overlay: 'scene',
    max: 1,
  },
  {
    id: 'A2',
    set: 'A',
    label: 'Biển số xe khách hàng',
    guide: 'Đưa biển số nằm ngang trong khung vàng. Ký tự phải đọc được.',
    overlay: 'plate',
    max: 1,
  },
  {
    id: 'A3',
    set: 'A',
    label: 'Góc trước – trái 45°',
    guide: 'Đứng vào vòng vàng, chéo 45° phía trước bên trái. Thấy đầu xe và hông trái.',
    overlay: 'front-left',
    max: 1,
  },
  {
    id: 'A4',
    set: 'A',
    label: 'Góc trước – phải 45°',
    guide: 'Đứng vào vòng vàng, chéo 45° phía trước bên phải. Thấy đầu xe và hông phải.',
    overlay: 'front-right',
    max: 1,
  },
  {
    id: 'A5',
    set: 'A',
    label: 'Góc sau – trái 45°',
    guide: 'Đứng vào vòng vàng, chéo 45° phía sau bên trái. Thấy đuôi xe và hông trái.',
    overlay: 'rear-left',
    max: 1,
  },
  {
    id: 'A6',
    set: 'A',
    label: 'Góc sau – phải 45°',
    guide: 'Đứng vào vòng vàng, chéo 45° phía sau bên phải. Thấy đuôi xe và hông phải.',
    overlay: 'rear-right',
    max: 1,
  },
  {
    id: 'A7',
    set: 'A',
    label: 'Cận cảnh từng vết trầy, móp, nứt có sẵn',
    guide: 'Đưa một vết vào vòng tròn. Mỗi vết một ảnh. Bỏ qua nếu xe không có vết sẵn.',
    overlay: 'damage',
    max: 6,
    optional: true,
  },
  {
    id: 'A8',
    set: 'A',
    label: 'Taplo và đồng hồ ODO',
    guide: 'Bật đèn taplo. Đưa số ODO vào khung vàng, đọc rõ số km.',
    overlay: 'dashboard',
    max: 1,
  },
  {
    id: 'A9',
    set: 'A',
    label: 'Giấy đăng ký xe / Giấy đăng kiểm / Tem đăng kiểm',
    guide: 'Trải giấy phẳng. Đưa đủ bốn góc giấy vào khung, chữ không bị lóa.',
    overlay: 'document',
    max: 1,
  },
  {
    id: 'A10',
    set: 'A',
    label: 'Tình trạng lỗi sự cố',
    guide: 'Cận cảnh đúng bộ phận đang hỏng. Thấy vị trí sự cố và một phần thân xe.',
    overlay: 'fault',
    max: 1,
  },
  {
    id: 'A11',
    set: 'A',
    label: 'Nội thất và khoang hành lý',
    guide: 'Chụp khoang lái trước, rồi mở cốp chụp khoang hành lý.',
    overlay: 'interior',
    max: 2,
  },
  {
    id: 'B1',
    set: 'B',
    label: 'Thao tác xử lý tại hiện trường',
    guide: 'Đưa thao tác đang làm vào khung vàng. Thấy tay, dụng cụ và vị trí trên xe.',
    overlay: 'action',
    max: 3,
  },
  {
    id: 'B2',
    set: 'B',
    label: 'Xe khách hàng đã đưa lên sàn',
    guide: 'Lùi ra để thấy cả xe khách đã nằm trên sàn xe cứu hộ.',
    overlay: 'flatbed',
    max: 1,
    towOnly: true,
  },
  {
    id: 'B3',
    set: 'B',
    label: 'Điểm chằng buộc, dây neo',
    guide: 'Cận cảnh móc, dây neo và điểm bám. Thấy dây đã căng.',
    overlay: 'strap',
    max: 1,
    towOnly: true,
  },
  {
    id: 'B4',
    set: 'B',
    label: 'Chi phí phụ nếu có',
    guide: 'Chụp hóa đơn hoặc khoản phí phụ. Bỏ qua nếu không phát sinh.',
    overlay: 'receipt',
    max: 3,
    optional: true,
  },
  {
    id: 'C1',
    set: 'C',
    label: 'Bàn giao xe tại địa chỉ kéo về',
    guide: 'Đưa xe và mặt tiền điểm giao vào khung. Biển số vẫn đọc được.',
    overlay: 'handover',
    max: 1,
  },
  {
    id: 'C2',
    set: 'C',
    label: 'Bốn góc thân xe lần hai',
    guide: 'Chụp lần lượt bốn góc. Vòng vàng là chỗ đứng của ảnh đang chụp.',
    overlay: 'corners',
    max: 4,
  },
  {
    id: 'C3',
    set: 'C',
    label: 'Biên bản xác nhận bàn giao xe cho xưởng đã ký',
    guide: 'Đưa biên bản đã ký vào khung. Thấy chữ ký và nội dung.',
    overlay: 'signed',
    max: 1,
  },
  {
    id: 'C4',
    set: 'C',
    label: 'Taplo và ODO lần hai',
    guide: 'Chụp lại taplo khi bàn giao. Số ODO nằm trong khung vàng.',
    overlay: 'dashboard',
    max: 1,
  },
];

export const RESCUE_SET_META: {
  id: RescuePhotoSet;
  short: string;
  tab: string;
  title: string;
  lead: string;
  leadOnSite?: string;
}[] = [
  {
    id: 'A',
    short: 'Bộ A',
    tab: 'Hiện trường',
    title: 'Hiện trường',
    lead: 'Chụp ngay khi đến điểm cứu hộ, trước khi xử lý xe.',
  },
  {
    id: 'B',
    short: 'Bộ B',
    tab: 'Xử lý',
    title: 'Quá trình xử lý',
    lead: 'Chụp đủ trước khi bắt đầu kéo xe. Có ảnh thao tác, xe lên sàn và dây neo.',
    leadOnSite: 'Chụp đủ trước khi hoàn thành cứu hộ. Ảnh lên sàn và dây neo chỉ dùng khi có kéo xe.',
  },
  {
    id: 'C',
    short: 'Bộ C',
    tab: 'Bàn giao',
    title: 'Bàn giao',
    lead: 'Chụp khi bàn giao xe, sau khi hoàn thành cứu hộ.',
  },
];

const SET_CATEGORY: Record<RescuePhotoSet, RescuePhotoCategory> = {
  A: 'hien-truong',
  B: 'qua-trinh',
  C: 'hoan-tat',
};

export function photoSetFromQuery(set: string | null, legacyType: string | null): RescuePhotoSet | null {
  if (set === 'A' || set === 'B' || set === 'C') return set;
  if (legacyType === 'hien-truong') return 'A';
  if (legacyType === 'qua-trinh') return 'B';
  if (legacyType === 'hoan-tat') return 'C';
  return null;
}

export function categoryForSet(set: RescuePhotoSet): RescuePhotoCategory {
  return SET_CATEGORY[set];
}

export function shotsForSet(set: RescuePhotoSet, hasTow: boolean): RescueShotDef[] {
  return RESCUE_SHOTS.filter((shot) => shot.set === set && (hasTow || !shot.towOnly));
}

export function findShot(id: RescueShotId): RescueShotDef {
  return RESCUE_SHOTS.find((shot) => shot.id === id)!;
}

const CORNER_NAMES = ['góc trước trái', 'góc trước phải', 'góc sau trái', 'góc sau phải'];

export function shotHint(shot: RescueShotDef, taken: number): string {
  if (shot.overlay === 'corners') {
    return `Chụp ${CORNER_NAMES[taken % 4]}. Đứng vào vòng vàng, chéo 45°.`;
  }
  if (shot.overlay === 'interior') {
    return taken % 2 === 0
      ? 'Chụp khoang lái: ghế trước và taplo nhìn từ cửa.'
      : 'Mở cốp, chụp khoang hành lý.';
  }
  return shot.guide;
}

export function overlayStep(kind: CaptureOverlayKind, taken: number): number {
  if (kind === 'corners') return taken % 4;
  if (kind === 'interior') return taken % 2;
  return 0;
}

/** Ảnh nhiều khung cố định thì chụp đủ số lượng rồi mới sang mã sau. */
export function continuesUntilFull(shot: RescueShotDef): boolean {
  return shot.overlay === 'corners' || shot.overlay === 'interior';
}

/** Số ảnh bắt buộc. Mã không bắt buộc thì là 0. */
export function requiredCount(shot: RescueShotDef): number {
  if (shot.optional) return 0;
  if (continuesUntilFull(shot)) return shot.max;
  return 1;
}

export type ShotCount = (id: RescueShotId) => number;

export function firstOpenShot(shots: RescueShotDef[], takenOf: ShotCount): RescueShotDef | undefined {
  return shots.find((shot) => {
    const taken = takenOf(shot.id);
    if (continuesUntilFull(shot)) return taken < shot.max;
    return taken === 0;
  });
}

export function shotAfterCapture(
  shots: RescueShotDef[],
  takenOf: ShotCount,
  currentId: RescueShotId,
  forceAdvance = false,
): RescueShotId | null {
  const current = shots.find((shot) => shot.id === currentId);
  if (!current) return null;
  const taken = takenOf(current.id);
  if (!forceAdvance && continuesUntilFull(current) && taken < current.max) return current.id;
  const index = shots.findIndex((shot) => shot.id === currentId);
  return firstOpenShot(shots.slice(index + 1), takenOf)?.id ?? null;
}

export type ShotDraft = Partial<Record<RescueShotId, string[]>>;

export function emptyShotDraft(): ShotDraft {
  return {};
}

export function shotDraftFromOrder(photos: ShotDraft | undefined): ShotDraft {
  if (!photos) return {};
  const draft: ShotDraft = {};
  RESCUE_SHOTS.forEach((shot) => {
    const items = photos[shot.id];
    if (items?.length) draft[shot.id] = [...items];
  });
  return draft;
}

export function shotDraftsEqual(a: ShotDraft, b: ShotDraft): boolean {
  return RESCUE_SHOTS.every((shot) => {
    const left = a[shot.id] ?? [];
    const right = b[shot.id] ?? [];
    return left.length === right.length && left.every((src, index) => src === right[index]);
  });
}

export function photosOfSet(draft: ShotDraft, set: RescuePhotoSet): string[] {
  return RESCUE_SHOTS.filter((shot) => shot.set === set).flatMap((shot) => draft[shot.id] ?? []);
}

/** Giữ ảnh cũ không thuộc bộ shot, rồi gắn ảnh shot mới. */
export function syncCategoryPhotos(
  existing: string[] | undefined,
  previousShotPhotos: string[],
  nextShotPhotos: string[],
): string[] {
  const kept = (existing ?? []).filter((src) => !previousShotPhotos.includes(src));
  const merged = [...kept];
  nextShotPhotos.forEach((src) => {
    if (!merged.includes(src)) merged.push(src);
  });
  return merged;
}
