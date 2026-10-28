export type VehicleAssignment = 'primary' | 'secondary';
export type VehicleRunStatus = 'ready' | 'repair';
export type RepairRequestStatus = 'pending' | 'rejected' | 'ordered';

export interface DriverVehicle {
  id: string;
  plate: string;
  type: string;
  brand: string;
  modelLine: string;
  station: string;
  status: VehicleRunStatus;
  primaryDriverId: string;
  secondaryDriverId: string | null;
  parkAddress: string;
  odoKm: string;
  toolNote: string;
  photos: string[];
  /** Mã số đăng trước, đúng 3 chữ số. */
  regCode: string;
  inspectionDueDays: number;
  gplhDueDays: number;
  tndsDueDays: number;
  maintenanceDueDays: number;
  brokenToolCount: number;
  specs: VehicleSpecs;
}

export interface VehicleTool {
  name: string;
  quantity: number;
  unit: string;
  condition: 'good' | 'broken' | 'missing';
}

export interface VehicleMaintHistory {
  at: string;
  odoKm: string;
  content: string;
}

export interface VehicleDoc {
  type: string;
  number: string;
  issuedAt: string;
  expiryAt: string;
  daysLeft: number | null;
  fileName: string;
}

export interface VehicleSpecs {
  year: string;
  chassis: string;
  engineNo: string;
  ownership: string;
  fuel: string;
  registrationDate: string;
  nienHan: string;
  caiHoan: boolean;
  caiHoanGcn: string;
  kdvtYes: boolean;
  inspectionValidUntil: string;
  outerLengthMm: string;
  outerWidthMm: string;
  outerHeightMm: string;
  deckLengthMm: string;
  deckWidthMm: string;
  wheelFormula: string;
  seats: string;
  weightTkKg: string;
  weightCpKg: string;
  cargoTkKg: string;
  cargoCpKg: string;
  towTkKg: string;
  towCpKg: string;
  totalTkKg: string;
  totalCpKg: string;
  rescueCapabilities: string[];
  acceptedVehicles: string[];
  maintenanceCycleKm: string;
  maintenanceLastAt: string;
  maintenanceNextAt: string;
  maintenanceStatus: string;
  imei: string;
  midKm: string;
  camera: string;
  docs: VehicleDoc[];
  tools: VehicleTool[];
  maintenanceHistory: VehicleMaintHistory[];
}

export const VEHICLE_TYPE_OPTIONS = [
  'Xe cẩu bánh vòng',
  'Xe cẩu sàn',
  'Xe sàn trượt',
  'Xe kéo móc',
  'Xe tiếp nhiên liệu',
  'Xe cứu hộ lốp',
];

export const VEHICLE_BRAND_OPTIONS = ['Hino', 'Isuzu', 'Dongfeng'];
export const VEHICLE_STATION_OPTIONS = ['Trạm Hoàng Mai', 'Trạm Hà Đông'];
export const OWNERSHIP_OPTIONS = ['Công ty', 'Thuê', 'Đối tác vệ tinh'];
export const FUEL_OPTIONS = ['Diesel', 'Xăng', 'Điện'];
export const RESCUE_CAPABILITY_OPTIONS = ['Sàn trượt', 'Kéo', 'Cẩu', 'Càng nâng'];
export const ACCEPTED_VEHICLE_OPTIONS = ['Xe con', 'SUV', 'Bán tải', 'Xe điện', 'Tải nhẹ', 'Xe van'];

export const emptyVehicleSpecs = (): VehicleSpecs => ({
  year: '',
  chassis: '',
  engineNo: '',
  ownership: '',
  fuel: '',
  registrationDate: '',
  nienHan: '',
  caiHoan: false,
  caiHoanGcn: '',
  kdvtYes: false,
  inspectionValidUntil: '',
  outerLengthMm: '',
  outerWidthMm: '',
  outerHeightMm: '',
  deckLengthMm: '',
  deckWidthMm: '',
  wheelFormula: '',
  seats: '',
  weightTkKg: '',
  weightCpKg: '',
  cargoTkKg: '',
  cargoCpKg: '',
  towTkKg: '',
  towCpKg: '',
  totalTkKg: '',
  totalCpKg: '',
  rescueCapabilities: [],
  acceptedVehicles: [],
  maintenanceCycleKm: '',
  maintenanceLastAt: '',
  maintenanceNextAt: '',
  maintenanceStatus: '',
  imei: '',
  midKm: '',
  camera: '',
  docs: [],
  tools: [],
  maintenanceHistory: [],
});

export interface VehicleAlert {
  level: 'hard' | 'warn';
  text: string;
}

export interface VehicleSupplement {
  parkAddress: string;
  odoKm: string;
  toolNote: string;
  photos: string[];
}

export interface RepairRequest {
  id: string;
  vehicleId: string;
  priority: string;
  partGroup: string;
  symptom: string;
  description: string;
  status: RepairRequestStatus;
  createdAt: string;
  rejectReason?: string;
}

export const REPAIR_PRIORITIES = [
  'Khẩn cấp (Dừng xe ngay)',
  'Cao (Khắc phục trong 24h)',
  'Bình thường (Theo lịch)',
] as const;

export const REPAIR_PART_GROUPS = [
  'Cẩu và ray sàn trượt thủy lực',
  'Lốp và hệ thống phanh',
  'Động cơ và hộp số',
  'Hệ thống điện và đèn cứu hộ',
  'Bộ phận khác',
] as const;

export const DEFAULT_REPAIR_PRIORITY = REPAIR_PRIORITIES[1];
export const DEFAULT_REPAIR_PART_GROUP = REPAIR_PART_GROUPS[0];

export const ASSIGNMENT_LABEL: Record<VehicleAssignment, string> = {
  primary: 'Xe chính',
  secondary: 'Xe phụ',
};

export const RUN_STATUS_LABEL: Record<VehicleRunStatus, string> = {
  ready: 'Sẵn sàng',
  repair: 'Đang sửa chữa',
};

export const REPAIR_STATUS_LABEL: Record<RepairRequestStatus, string> = {
  pending: 'Chờ duyệt',
  rejected: 'Từ chối',
  ordered: 'Đã lập lệnh',
};

type SeedVehicle = Omit<
  DriverVehicle,
  | 'regCode'
  | 'inspectionDueDays'
  | 'gplhDueDays'
  | 'tndsDueDays'
  | 'maintenanceDueDays'
  | 'brokenToolCount'
  | 'specs'
>;

const SEED_VEHICLES: SeedVehicle[] = [
  {
    id: 'v1',
    plate: '29C-12345',
    type: 'Xe cẩu bánh vòng',
    brand: 'Hino',
    modelLine: '500 Series',
    station: 'Trạm Hoàng Mai',
    status: 'ready',
    primaryDriverId: 'd1',
    secondaryDriverId: 'd3',
    parkAddress: 'Sân trạm Hoàng Mai',
    odoKm: '128450',
    toolNote: '',
    photos: [
      '/mock-photos/tow-truck-1.jpg',
      '/mock-photos/tow-1.jpg',
      '/mock-photos/car-parked-1.jpg',
      '/mock-photos/car-repair-1.jpg',
    ],
  },
  {
    id: 'v2',
    plate: '30H-88776',
    type: 'Xe cẩu sàn',
    brand: 'Isuzu',
    modelLine: 'FVR',
    station: 'Trạm Hoàng Mai',
    status: 'repair',
    primaryDriverId: 'd2',
    secondaryDriverId: 'd1',
    parkAddress: '',
    odoKm: '86420',
    toolNote: 'Thiếu 1 tăng đơ xích.',
    photos: [],
  },
  {
    id: 'v3',
    plate: '51G-55443',
    type: 'Xe kéo móc',
    brand: 'Dongfeng',
    modelLine: 'Hoàng Huy',
    station: 'Trạm Hà Đông',
    status: 'ready',
    primaryDriverId: 'd3',
    secondaryDriverId: 'd2',
    parkAddress: 'Bãi xe cổng phụ',
    odoKm: '210300',
    toolNote: '',
    photos: [],
  },
  {
    id: 'v4',
    plate: '29C-67890',
    type: 'Xe cẩu sàn',
    brand: 'Hino',
    modelLine: '300 Series',
    station: 'Trạm Hoàng Mai',
    status: 'ready',
    primaryDriverId: 'd1',
    secondaryDriverId: 'd2',
    parkAddress: 'Sân trước xưởng',
    odoKm: '54210',
    toolNote: '',
    photos: [],
  },
  {
    id: 'v5',
    plate: '30A-11223',
    type: 'Xe tiếp nhiên liệu',
    brand: 'Isuzu',
    modelLine: 'NQR',
    station: 'Trạm Hà Đông',
    status: 'repair',
    primaryDriverId: 'd1',
    secondaryDriverId: 'd3',
    parkAddress: '',
    odoKm: '97340',
    toolNote: 'Vòi cấp đang rò.',
    photos: [],
  },
  {
    id: 'v6',
    plate: '29H-44556',
    type: 'Xe kéo móc',
    brand: 'Dongfeng',
    modelLine: 'Hoàng Huy',
    station: 'Trạm Hoàng Mai',
    status: 'ready',
    primaryDriverId: 'd1',
    secondaryDriverId: 'd2',
    parkAddress: 'Bãi trong',
    odoKm: '156780',
    toolNote: '',
    photos: [],
  },
  {
    id: 'v7',
    plate: '51C-90812',
    type: 'Xe cẩu bánh vòng',
    brand: 'Hino',
    modelLine: '500 Series',
    station: 'Trạm Hà Đông',
    status: 'ready',
    primaryDriverId: 'd3',
    secondaryDriverId: 'd1',
    parkAddress: 'Cổng chính',
    odoKm: '73450',
    toolNote: '',
    photos: [],
  },
  {
    id: 'v8',
    plate: '43A-22110',
    type: 'Xe sàn trượt',
    brand: 'Isuzu',
    modelLine: 'FVR',
    station: 'Trạm Hoàng Mai',
    status: 'repair',
    primaryDriverId: 'd2',
    secondaryDriverId: 'd1',
    parkAddress: '',
    odoKm: '188920',
    toolNote: '',
    photos: [],
  },
  {
    id: 'v9',
    plate: '30G-33445',
    type: 'Xe cẩu sàn',
    brand: 'Hino',
    modelLine: '500 Series',
    station: 'Trạm Hoàng Mai',
    status: 'ready',
    primaryDriverId: 'd2',
    secondaryDriverId: 'd3',
    parkAddress: 'Sân trạm',
    odoKm: '64200',
    toolNote: '',
    photos: [],
  },
  {
    id: 'v10',
    plate: '29K-77665',
    type: 'Xe cứu hộ lốp',
    brand: 'Dongfeng',
    modelLine: 'Captain',
    station: 'Trạm Hà Đông',
    status: 'ready',
    primaryDriverId: 'd3',
    secondaryDriverId: 'd1',
    parkAddress: 'Bãi xe số 2',
    odoKm: '41280',
    toolNote: '',
    photos: [],
  },
];

const SEED_REQUESTS: RepairRequest[] = [
  {
    id: 'rr-seed-v1-1',
    vehicleId: 'v1',
    priority: 'Cao (Khắc phục trong 24h)',
    partGroup: 'Cẩu và ray sàn trượt thủy lực',
    symptom: 'Cẩu bánh vòng giật khi quay phải',
    description: 'Xuất hiện khi nâng tải khoảng 3 tấn.',
    status: 'pending',
    createdAt: '27/10/2026 09:20',
  },
  {
    id: 'rr-seed-v1-2',
    vehicleId: 'v1',
    priority: 'Bình thường (Theo lịch)',
    partGroup: 'Hệ thống điện và đèn cứu hộ',
    symptom: 'Đèn xi nhan sau trái không sáng',
    description: '',
    status: 'ordered',
    createdAt: '20/10/2026 14:10',
  },
  {
    id: 'rr-seed-v1-3',
    vehicleId: 'v1',
    priority: 'Bình thường (Theo lịch)',
    partGroup: 'Lốp và hệ thống phanh',
    symptom: 'Lốp sau phải mòn lệch',
    description: 'Đã đảo lốp tại trạm.',
    status: 'rejected',
    createdAt: '12/10/2026 11:05',
    rejectReason: 'Chưa đến hạn thay, theo dõi thêm 2.000 km.',
  },
  {
    id: 'rr-seed-1',
    vehicleId: 'v2',
    priority: 'Cao (Khắc phục trong 24h)',
    partGroup: 'Lốp và hệ thống phanh',
    symptom: 'Phanh hơi yếu khi tải nặng',
    description: 'Xuất hiện từ ca sáng, đạp sát sàn mới giữ được xe.',
    status: 'pending',
    createdAt: '28/10/2026 08:15',
  },
  {
    id: 'rr-seed-2',
    vehicleId: 'v3',
    priority: 'Bình thường (Theo lịch)',
    partGroup: 'Hệ thống điện và đèn cứu hộ',
    symptom: 'Đèn cảnh báo bên phải chớp không đều',
    description: '',
    status: 'rejected',
    createdAt: '26/10/2026 16:40',
    rejectReason: 'Đã xử lý tại trạm, không cần vào xưởng.',
  },
  {
    id: 'rr-seed-3',
    vehicleId: 'v5',
    priority: 'Khẩn cấp (Dừng xe ngay)',
    partGroup: 'Động cơ và hộp số',
    symptom: 'Rò dầu dưới gầm khi nổ máy',
    description: 'Vết dầu loang tại vị trí đỗ.',
    status: 'pending',
    createdAt: '28/10/2026 07:40',
  },
  {
    id: 'rr-seed-4',
    vehicleId: 'v8',
    priority: 'Cao (Khắc phục trong 24h)',
    partGroup: 'Cẩu và ray sàn trượt thủy lực',
    symptom: 'Sàn trượt kêu khi kéo ra',
    description: '',
    status: 'ordered',
    createdAt: '27/10/2026 14:05',
  },
];

const SEED_PROFILE: Record<
  string,
  Pick<
    DriverVehicle,
    'regCode' | 'inspectionDueDays' | 'gplhDueDays' | 'tndsDueDays' | 'maintenanceDueDays' | 'brokenToolCount'
  >
> = {
  v1: { regCode: '021', inspectionDueDays: 22, gplhDueDays: 40, tndsDueDays: -15, maintenanceDueDays: 12, brokenToolCount: 1 },
  v2: { regCode: '032', inspectionDueDays: 8, gplhDueDays: 5, tndsDueDays: 60, maintenanceDueDays: 4, brokenToolCount: 1 },
  v3: { regCode: '018', inspectionDueDays: 70, gplhDueDays: 15, tndsDueDays: 25, maintenanceDueDays: 20, brokenToolCount: 0 },
  v4: { regCode: '044', inspectionDueDays: 120, gplhDueDays: 90, tndsDueDays: 80, maintenanceDueDays: 60, brokenToolCount: 0 },
  v5: { regCode: '007', inspectionDueDays: 45, gplhDueDays: 90, tndsDueDays: 3, maintenanceDueDays: -3, brokenToolCount: 0 },
  v6: { regCode: '056', inspectionDueDays: 100, gplhDueDays: 80, tndsDueDays: 40, maintenanceDueDays: 30, brokenToolCount: 0 },
  v7: { regCode: '063', inspectionDueDays: 9, gplhDueDays: 70, tndsDueDays: 16, maintenanceDueDays: 60, brokenToolCount: 0 },
  v8: { regCode: '015', inspectionDueDays: -12, gplhDueDays: 20, tndsDueDays: 14, maintenanceDueDays: 33, brokenToolCount: 2 },
  v9: { regCode: '028', inspectionDueDays: 140, gplhDueDays: 200, tndsDueDays: 110, maintenanceDueDays: 80, brokenToolCount: 0 },
  v10: { regCode: '039', inspectionDueDays: 18, gplhDueDays: 26, tndsDueDays: -8, maintenanceDueDays: 2, brokenToolCount: 0 },
};

const DUE_LABELS: { key: keyof Pick<DriverVehicle, 'inspectionDueDays' | 'tndsDueDays' | 'gplhDueDays' | 'maintenanceDueDays'>; label: string }[] = [
  { key: 'inspectionDueDays', label: 'Đăng kiểm' },
  { key: 'tndsDueDays', label: 'BH TNDS' },
  { key: 'gplhDueDays', label: 'GPLH' },
  { key: 'maintenanceDueDays', label: 'Bảo dưỡng' },
];

export function vehicleAlerts(vehicle: DriverVehicle): VehicleAlert[] {
  const alerts: VehicleAlert[] = [];
  DUE_LABELS.forEach(({ key, label }) => {
    const days = vehicle[key];
    if (days < 0) alerts.push({ level: 'hard', text: `${label} quá hạn ${Math.abs(days)} ngày` });
    else if (days <= 30) alerts.push({ level: 'warn', text: `${label} còn ${days} ngày` });
  });
  if (vehicle.brokenToolCount > 0) {
    alerts.push({ level: 'hard', text: `Công cụ ${vehicle.brokenToolCount} món lỗi` });
  }
  alerts.sort((a, b) => (a.level === b.level ? 0 : a.level === 'hard' ? -1 : 1));
  return alerts;
}

function nextRegCode(): string {
  const used = new Set(vehicles.map((item) => item.regCode));
  for (let value = 1; value < 1000; value += 1) {
    const code = String(value).padStart(3, '0');
    if (!used.has(code)) return code;
  }
  return '000';
}

const V1_SPECS: VehicleSpecs = {
  year: '2022',
  chassis: 'JALC4B16X07001234',
  engineNo: '4HK1-123456',
  ownership: 'Công ty',
  fuel: 'Diesel',
  registrationDate: '15/03/2022',
  nienHan: '2047',
  caiHoan: true,
  caiHoanGcn: 'GCN-2903-2022',
  kdvtYes: true,
  inspectionValidUntil: '11/09/2026',
  outerLengthMm: '7450',
  outerWidthMm: '2250',
  outerHeightMm: '2950',
  deckLengthMm: '5600',
  deckWidthMm: '2100',
  wheelFormula: '4x2',
  seats: '3',
  weightTkKg: '4500',
  weightCpKg: '8000',
  cargoTkKg: '5500',
  cargoCpKg: '3500',
  towTkKg: '4000',
  towCpKg: '8000',
  totalTkKg: '10645',
  totalCpKg: '11500',
  rescueCapabilities: ['Sàn trượt', 'Kéo', 'Cẩu'],
  acceptedVehicles: ['Xe con', 'SUV', 'Bán tải', 'Xe điện'],
  maintenanceCycleKm: '5000',
  maintenanceLastAt: '15/07/2026',
  maintenanceNextAt: '15/10/2026',
  maintenanceStatus: 'Sắp đến hạn',
  imei: '861200034567345',
  midKm: '14.280',
  camera: 'CAM-F012 · Full HD 1080p',
  docs: [
    { type: 'Đăng kiểm', number: 'DK-29C-12345', issuedAt: '11/09/2025', expiryAt: '11/09/2026', daysLeft: 22, fileName: 'dang-kiem-29C-12345.pdf' },
    { type: 'BH TNDS', number: 'BH-2903-8891', issuedAt: '01/10/2025', expiryAt: '01/10/2026', daysLeft: -15, fileName: 'bh-tnds-29C-12345.pdf' },
    { type: 'GPLH', number: 'GPLH-021', issuedAt: '01/03/2024', expiryAt: '08/12/2026', daysLeft: 40, fileName: 'gplh-021.pdf' },
  ],
  tools: [
    { name: 'Dây tăng bánh', quantity: 2, unit: 'Sợi', condition: 'good' },
    { name: 'Dây cáp vải', quantity: 2, unit: 'Sợi', condition: 'good' },
    { name: 'Ma ní', quantity: 4, unit: 'Cái', condition: 'good' },
    { name: 'Xích', quantity: 1, unit: 'Bộ', condition: 'broken' },
    { name: 'Móc cẩu', quantity: 2, unit: 'Cái', condition: 'good' },
    { name: 'Cọc phản quang', quantity: 4, unit: 'Cái', condition: 'good' },
    { name: 'Đèn pin', quantity: 0, unit: 'Cái', condition: 'missing' },
    { name: 'Bình chữa cháy', quantity: 1, unit: 'Bình', condition: 'good' },
  ],
  maintenanceHistory: [
    { at: '15/07/2026', odoKm: '101200', content: 'Bảo dưỡng cấp 1' },
    { at: '12/01/2026', odoKm: '61200', content: 'Thay dầu máy và lọc gió' },
    { at: '20/08/2025', odoKm: '24800', content: 'Bảo dưỡng cấp 1' },
  ],
};

function specsFor(item: SeedVehicle): VehicleSpecs {
  if (item.id === 'v1') return V1_SPECS;
  const crane = /cẩu|sàn/i.test(item.type);
  return {
    ...emptyVehicleSpecs(),
    year: '2021',
    ownership: 'Công ty',
    fuel: 'Diesel',
    seats: '3',
    wheelFormula: '4x2',
    rescueCapabilities: crane ? ['Cẩu', 'Kéo'] : ['Kéo'],
    acceptedVehicles: ['Xe con', 'SUV'],
    maintenanceCycleKm: '5000',
    maintenanceStatus: 'Đúng hạn',
    midKm: item.odoKm ? formatOdo(item.odoKm) : '',
  };
}

let vehicles: DriverVehicle[] = SEED_VEHICLES.map((item) => ({
  ...item,
  photos: [...item.photos],
  specs: specsFor(item),
  ...(SEED_PROFILE[item.id] ?? {
    regCode: '000',
    inspectionDueDays: 365,
    gplhDueDays: 365,
    tndsDueDays: 365,
    maintenanceDueDays: 365,
    brokenToolCount: 0,
  }),
}));
let requests: RepairRequest[] = SEED_REQUESTS.map((item) => ({ ...item }));

export function assignmentOf(vehicle: DriverVehicle, driverId: string): VehicleAssignment | null {
  if (vehicle.primaryDriverId === driverId) return 'primary';
  if (vehicle.secondaryDriverId === driverId) return 'secondary';
  return null;
}

export function vehiclesForDriver(driverId: string): DriverVehicle[] {
  return vehicles.filter((item) => assignmentOf(item, driverId));
}

export function addDriverVehicle(input: {
  driverId: string;
  role: VehicleAssignment;
  plate: string;
  type: string;
  brand: string;
  modelLine: string;
  station: string;
  parkAddress: string;
  odoKm: string;
  photos: string[];
  specs: VehicleSpecs;
}): DriverVehicle {
  const created: DriverVehicle = {
    id: `v-${Date.now()}`,
    plate: input.plate.trim().toUpperCase(),
    type: input.type.trim(),
    brand: input.brand.trim(),
    modelLine: input.modelLine.trim(),
    station: input.station.trim(),
    status: 'ready',
    primaryDriverId: input.role === 'primary' ? input.driverId : '',
    secondaryDriverId: input.role === 'secondary' ? input.driverId : null,
    parkAddress: input.parkAddress.trim(),
    odoKm: input.odoKm.replace(/\D/g, ''),
    toolNote: '',
    photos: [...input.photos],
    regCode: nextRegCode(),
    inspectionDueDays: 365,
    gplhDueDays: 365,
    tndsDueDays: 365,
    maintenanceDueDays: 365,
    brokenToolCount: 0,
    specs: {
      ...input.specs,
      docs: input.specs.docs.map((doc) => ({ ...doc })),
      rescueCapabilities: [...input.specs.rescueCapabilities],
      acceptedVehicles: [...input.specs.acceptedVehicles],
      midKm: input.odoKm ? formatOdo(input.odoKm) : input.specs.midKm,
    },
  };
  vehicles = [created, ...vehicles];
  return created;
}

export function plateTaken(plate: string): boolean {
  const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return vehicles.some((item) => item.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalized);
}

export function getDriverVehicle(id: string): DriverVehicle | undefined {
  return vehicles.find((item) => item.id === id);
}

export function repairRequestsOf(vehicleId: string): RepairRequest[] {
  return requests.filter((item) => item.vehicleId === vehicleId);
}

export function pendingRepairCount(vehicleId: string): number {
  return requests.filter((item) => item.vehicleId === vehicleId && item.status === 'pending').length;
}

export function updateVehicleSupplement(id: string, patch: VehicleSupplement): DriverVehicle | undefined {
  const current = getDriverVehicle(id);
  if (!current) return undefined;
  const removed = current.photos.filter((url) => !patch.photos.includes(url));
  removed.forEach((url) => {
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
  });
  const next: DriverVehicle = { ...current, ...patch, photos: [...patch.photos] };
  vehicles = vehicles.map((item) => (item.id === id ? next : item));
  return next;
}

export function addRepairRequest(
  input: Omit<RepairRequest, 'id' | 'status' | 'createdAt'>,
): RepairRequest {
  const created: RepairRequest = {
    ...input,
    id: `rr-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
  };
  requests = [created, ...requests];
  return created;
}

export function formatOdo(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('vi-VN');
}
