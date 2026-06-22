export interface QuoteDriverOption {
  id: string;
  name: string;
  phone: string;
}

export interface RescueVehicleOption {
  id: string;
  plate: string;
  type: string;
}

export const MOCK_QUOTE_DRIVERS: QuoteDriverOption[] = [
  { id: 'd1', name: 'Nguyễn Văn Hùng', phone: '0912345678' },
  { id: 'd2', name: 'Trần Minh Tuấn', phone: '0987654321' },
  { id: 'd3', name: 'Lê Thị Mai', phone: '0909123456' },
];

export const MOCK_RESCUE_VEHICLES: RescueVehicleOption[] = [
  { id: 'v1', plate: '29C-12345', type: 'Xe cẩu bánh vòng' },
  { id: 'v2', plate: '30H-88776', type: 'Xe cẩu sàn' },
  { id: 'v3', plate: '51G-55443', type: 'Xe kéo móc' },
  { id: 'v4', plate: '43A-22110', type: 'Xe tiếp nhiên liệu' },
];
