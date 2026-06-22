export type DriverRole = 'quote-rescue' | 'quote-only' | 'rescue-only';

export type QuoteStatus = 'cho-bao-gia' | 'da-bao-gia';

export type QuoteChipFilter = 'tat-ca' | QuoteStatus;

export interface QuoteOrder {
  id: string;
  orderCode: string;
  plate: string;
  brand: string;
  model: string;
  address: string;
  towDestination?: string;
  timestamp: string;
  serviceName: string;
  packageTag: 'Trong gói' | 'Ngoài gói';
  serviceMode: 'Cẩu kéo' | 'Hỗ trợ tại chỗ';
  distanceKm: number;
  towKm?: number;
  incidentPhotos?: string[];
  quoteCountdownSeconds?: number;
  quoteStatus: QuoteStatus;
  quotedPrice?: number;
  quotedEtaMinutes?: number;
  quotedNote?: string;
  quotedDriverName?: string;
  quotedDriverPhone?: string;
  rescueVehiclePlate?: string;
  rescueVehicleType?: string;
  /** Mô tả ngắn sự cố */
  condition?: string;
  /** Mô tả chi tiết sự cố */
  conditionDescription?: string;
}

export const DRIVER_ROLE_LABELS: Record<DriverRole, string> = {
  'quote-rescue': 'Vừa báo giá, vừa cứu hộ',
  'quote-only': 'Chỉ báo giá',
  'rescue-only': 'Chỉ cứu hộ',
};

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  'cho-bao-gia': 'Chờ báo giá',
  'da-bao-gia': 'Đã báo giá',
};

export const QUOTE_CHIP_FILTERS: { id: QuoteChipFilter; label: string }[] = [
  { id: 'tat-ca', label: 'Tất cả' },
  { id: 'cho-bao-gia', label: 'Chờ báo giá' },
  { id: 'da-bao-gia', label: 'Đã báo giá' },
];

export const SERVICE_MODE_LABELS: Record<QuoteOrder['serviceMode'], string> = {
  'Hỗ trợ tại chỗ': 'Hỗ trợ tại chỗ',
  'Cẩu kéo': 'Cẩu kéo',
};

export const isTowQuote = (order: QuoteOrder) => order.serviceMode === 'Cẩu kéo';

export type RescueServiceMode = QuoteOrder['serviceMode'];

export const isTowRescueOrder = (order: RescueOrder) =>
  Boolean(order.towDestination) || /kéo|cẩu/i.test(order.services);

export const getRescueServiceMode = (order: RescueOrder): RescueServiceMode =>
  isTowRescueOrder(order) ? 'Cẩu kéo' : 'Hỗ trợ tại chỗ';

export const RESCUE_VEHICLE_TYPES = [
  'Xe cẩu bánh vòng',
  'Xe cẩu sàn',
  'Xe kéo móc',
  'Xe tiếp nhiên liệu',
  'Xe kích bình',
];

export type OrderStatus =
  | 'cho-nhan'
  | 'dang-cuu-ho'
  | 'hoan-thanh'
  | 'tu-choi'
  | 'huy-don';

export type JobStage =
  | 'cho-nhan'
  | 'da-nhan'
  | 'da-den-diem'
  | 'dang-keo'
  | 'hoan-thanh';

export type ChipFilter = 'tat-ca' | OrderStatus;

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ServiceLine {
  name: string;
  value: string;
}

/** Trạng thái phân công của từng tài xế với đơn */
export type AssignmentStatus =
  | 'cho-nhan'
  | 'dang-cuu-ho'
  | 'hoan-thanh'
  | 'tu-choi'
  | 'het-han';

export interface OrderAssignment {
  driverId: string;
  driverName: string;
  status: AssignmentStatus;
  /** Tài xế đang xử lý đơn (nếu có) */
  isActive?: boolean;
}

export interface RescueOrder {
  id: string;
  plate: string;
  brand: string;
  model: string;
  address: string;
  towDestination?: string;
  timestamp: string;
  services: string;
  serviceLines?: ServiceLine[];
  status: OrderStatus;
  jobStage?: JobStage;
  acceptCountdown?: string;
  monthGroup: string;
  distanceKm?: number;
  etaMinutes?: number;
  etaTime?: string;
  condition?: string;
  estimatedTotal?: number;
  extraCost?: number;
  vat?: number;
  /** Mã đơn hiển thị (RSA-...) */
  orderCode?: string;
  /** Giá đã được vận hành / khách chốt */
  priceConfirmed?: boolean;
  /** Liên kết đơn báo giá gốc */
  quoteOrderId?: string;
  /** SLA mềm — phản hồi trước thời điểm này */
  respondBy?: string;
  /** Đã phân công cho tài xế khác (không tự nhận) */
  delegatedToDriverId?: string;
  delegatedToDriverName?: string;
  delegatedToDriverPhone?: string;
  /** Tài xế đang xử lý đơn tại trạm */
  activeHandlerDriverId?: string;
  activeHandlerDriverName?: string;
  /** Lịch sử phân công theo từng tài xế */
  assignments?: OrderAssignment[];
  /** Tiến độ di chuyển tới điểm (0–100, càng cao càng gần) */
  travelProgress?: number;
  delegatedVehiclePlate?: string;
  /** Lý do phân công / thay đổi tài xế */
  assignChangeReason?: string;
  pickupCoords?: GeoPoint;
  towCoords?: GeoPoint;
  customerPhone?: string;
  customerName?: string;
  /** Mô tả chi tiết tình trạng xe */
  conditionDescription?: string;
  /** Số tiền khách đã cọc */
  depositPaid?: number;
  /** Ảnh hiện trường sự cố (từ khách hoặc tài xế) */
  incidentPhotos?: string[];
  /** Ảnh quá trình xử lý (tài xế chụp/tải lên) */
  processPhotos?: string[];
  /** Ảnh hoàn tất cứu hộ (tài xế chụp/tải lên) */
  completionPhotos?: string[];
}

export type RescuePhotoCategory = 'hien-truong' | 'qua-trinh' | 'hoan-tat';

export const RESCUE_PHOTO_CATEGORIES: {
  id: RescuePhotoCategory;
  label: string;
  hint: string;
  field: 'incidentPhotos' | 'processPhotos' | 'completionPhotos';
  max: number;
}[] = [
  {
    id: 'hien-truong',
    label: 'Hiện trường sự cố',
    hint: 'Chụp khi vừa đến nơi. Góc 45° phía trước bên trái, biển số rõ và xe nguyên vẹn, đủ ánh sáng.',
    field: 'incidentPhotos',
    max: 4,
  },
  {
    id: 'qua-trinh',
    label: 'Quá trình xử lý',
    hint: 'Chụp trong lúc thao tác cứu hộ. Rõ thao tác đang thực hiện, tình trạng xe và biển số.',
    field: 'processPhotos',
    max: 4,
  },
  {
    id: 'hoan-tat',
    label: 'Hoàn tất cứu hộ',
    hint: 'Chụp sau khi xử lý xong, trước khi rời đi. Rõ biển số và kết quả cứu hộ.',
    field: 'completionPhotos',
    max: 4,
  },
];

export interface FilterState {
  fromDate: string;
  toDate: string;
  plate: string;
  serviceTypes: string[];
  statuses: OrderStatus[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  'cho-nhan': 'Chờ nhận',
  'dang-cuu-ho': 'Đang cứu hộ',
  'hoan-thanh': 'Hoàn thành',
  'tu-choi': 'Từ chối',
  'huy-don': 'Huỷ đơn',
};

export const ASSIGNMENT_STATUS_LABELS: Record<AssignmentStatus, string> = {
  'cho-nhan': 'Chờ nhận',
  'dang-cuu-ho': 'Đang cứu hộ',
  'hoan-thanh': 'Hoàn thành',
  'tu-choi': 'Đã từ chối',
  'het-han': 'Hết hạn',
};

export const STATUS_STYLES: Record<
  OrderStatus,
  { dot: string; bg: string; text: string; border: string }
> = {
  'cho-nhan': { dot: '#ff8c2f', bg: '#fff8f0', text: '#b45309', border: '#ffe4c4' },
  'dang-cuu-ho': { dot: '#25a55e', bg: '#f2fef2', text: '#1a7a43', border: '#c8f0d0' },
  'hoan-thanh': { dot: '#3b82f6', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'tu-choi': { dot: '#8f9098', bg: '#f5f6f7', text: '#5e5d64', border: '#e3e4e6' },
  'huy-don': { dot: '#da2c39', bg: '#fff6f9', text: '#b4211f', border: '#fecdd3' },
};

export const JOB_STAGE_LABELS: Record<JobStage, string> = {
  'cho-nhan': 'Chờ nhận',
  'da-nhan': 'Đã nhận đơn',
  'da-den-diem': 'Đã đến điểm',
  'dang-keo': 'Đang kéo xe',
  'hoan-thanh': 'Hoàn thành',
};

export const CHIP_FILTERS: { id: ChipFilter; label: string; badge?: number }[] = [
  { id: 'tat-ca', label: 'Tất cả' },
  { id: 'cho-nhan', label: 'Chờ nhận', badge: 12 },
  { id: 'dang-cuu-ho', label: 'Đang cứu hộ' },
  { id: 'hoan-thanh', label: 'Hoàn thành' },
  { id: 'tu-choi', label: 'Từ chối' },
  { id: 'huy-don', label: 'Huỷ đơn' },
];

export const SERVICE_TYPE_OPTIONS = [
  'Chờ nhận',
  'Kích bình',
  'Sự cố về lốp',
  'Đổ xăng',
  'Thuỷ kích',
];
