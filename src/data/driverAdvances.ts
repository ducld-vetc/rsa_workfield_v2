export type DriverAdvanceStatus = 'pending' | 'confirmed' | 'rejected';
export type DriverAdvancePurpose = 'refund_customer' | 'pay_supplier';
export type DriverAdvancePayer = 'accountant' | 'customer' | 'supplier';

export interface DriverAdvance {
  id: string;
  orderId: string;
  purpose: DriverAdvancePurpose;
  reimburseBy: DriverAdvancePayer;
  requestedAmount: number;
  actualAmount: number | null;
  status: DriverAdvanceStatus;
  note: string;
  rejectReason: string;
  proofLabel: string;
  proofUrl: string;
  customerName: string;
  plate: string;
  requestedBy: string;
  requestedAt: string;
  payeeName: string;
  payeeRole: string;
  bank: string;
  account: string;
  accountName: string;
  reason: string;
  attachments: { label: string; url: string }[];
}

export const DRIVER_PURPOSE_LABEL: Record<DriverAdvancePurpose, string> = {
  refund_customer: 'Hoàn cho khách',
  pay_supplier: 'Trả NCC',
};

export const DRIVER_PAYER_LABEL: Record<DriverAdvancePayer, string> = {
  accountant: 'Kế toán',
  customer: 'Khách hàng',
  supplier: 'Nhà cung cấp',
};

export const DRIVER_STATUS_LABEL: Record<DriverAdvanceStatus, string> = {
  pending: 'Chờ ứng',
  confirmed: 'Thành công',
  rejected: 'Từ chối',
};

export const ADVANCE_REJECT_REASONS = [
  'Không đủ số dư để ứng',
  'Sai thông tin thụ hưởng',
  'Yêu cầu trùng hoặc đã ứng',
  'Không thuộc phạm vi được ứng',
  'Lý do khác',
];

const QR_IMAGE = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop';
const CCCD_FRONT = 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop';
const CCCD_BACK = 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop';

const listeners = new Set<() => void>();
let advances: DriverAdvance[] = [
  {
    id: 'adv-pending',
    orderId: 'RS12602020002',
    purpose: 'refund_customer',
    reimburseBy: 'accountant',
    requestedAmount: 200000,
    actualAmount: null,
    status: 'pending',
    note: 'Hoàn phần khách đã cọc dư',
    rejectReason: '',
    proofLabel: '',
    proofUrl: '',
    customerName: 'Nguyễn Văn Lộc',
    plate: '30F-42275',
    requestedBy: 'Nguyễn Thị Lan · OSA',
    requestedAt: '23/11/2026 09:15',
    payeeName: 'Nguyễn Văn Lộc',
    payeeRole: 'Khách hàng',
    bank: 'MB Bank',
    account: '9988776655',
    accountName: 'NGUYEN VAN LOC',
    reason: 'Khách thanh toán dư so với phí',
    attachments: [
      { label: 'QR chuyển khoản', url: QR_IMAGE },
      { label: 'CCCD mặt trước', url: CCCD_FRONT },
      { label: 'CCCD mặt sau', url: CCCD_BACK },
    ],
  },
  {
    id: 'adv-ncc',
    orderId: 'RS12607020001',
    purpose: 'pay_supplier',
    reimburseBy: 'supplier',
    requestedAmount: 400000,
    actualAmount: null,
    status: 'pending',
    note: 'Trạm yêu cầu thu trước khi xuất hóa đơn',
    rejectReason: '',
    proofLabel: '',
    proofUrl: '',
    customerName: 'Trần Thị Mai',
    plate: '30A-12345',
    requestedBy: 'Trần Văn Hùng · OSA',
    requestedAt: '23/11/2026 10:05',
    payeeName: 'Trạm cứu hộ Long Biên',
    payeeRole: 'Nhà cung cấp',
    bank: 'Vietcombank',
    account: '0123456789',
    accountName: 'TRAM CUU HO LONG BIEN',
    reason: 'Nhà cung cấp yêu cầu thu trước khi xuất hóa đơn',
    attachments: [{ label: 'QR chuyển khoản', url: QR_IMAGE }],
  },
  {
    id: 'adv-done',
    orderId: 'RS12607020003',
    purpose: 'pay_supplier',
    reimburseBy: 'customer',
    requestedAmount: 400000,
    actualAmount: 400000,
    status: 'confirmed',
    note: 'Ứng trả trạm',
    rejectReason: '',
    proofLabel: 'UNC_tra_ncc.jpg',
    proofUrl: '',
    customerName: 'Lê Văn Hùng',
    plate: '29B-88888',
    requestedBy: 'Nguyễn Thị Lan · OSA',
    requestedAt: '22/11/2026 16:40',
    payeeName: 'Trạm cứu hộ Cầu Giấy',
    payeeRole: 'Nhà cung cấp',
    bank: 'Techcombank',
    account: '190345678901',
    accountName: 'TRAM CUU HO CAU GIAY',
    reason: 'Ứng chi phí kéo xe tại hiện trường',
    attachments: [
      { label: 'QR chuyển khoản', url: QR_IMAGE },
      { label: 'CCCD mặt trước', url: CCCD_FRONT },
    ],
  },
];
let version = 0;

const emit = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

export const subscribeDriverAdvances = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getDriverAdvanceVersion = () => version;

export const listDriverAdvances = () => advances;

export const getDriverAdvance = (id: string) => advances.find((item) => item.id === id);

export const confirmDriverAdvance = (id: string, proofLabel: string, proofUrl: string) => {
  advances = advances.map((item) =>
    item.id === id && item.status === 'pending'
      ? { ...item, status: 'confirmed', actualAmount: item.requestedAmount, proofLabel, proofUrl }
      : item
  );
  emit();
};

export const rejectDriverAdvance = (id: string, rejectReason: string) => {
  advances = advances.map((item) =>
    item.id === id && item.status === 'pending'
      ? { ...item, status: 'rejected', rejectReason }
      : item
  );
  emit();
};
