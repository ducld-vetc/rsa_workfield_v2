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

export interface RescueStationOption {
  id: string;
  name: string;
}

export const MOCK_RESCUE_STATIONS: RescueStationOption[] = [
  { id: 'st-1', name: 'Trạm cứu hộ Thanh Xuân' },
  { id: 'st-2', name: 'Garage Thăng Long' },
  { id: 'st-3', name: 'Cứu hộ 116 Cầu Giấy' },
  { id: 'st-4', name: 'Trạm cứu hộ Hà Đông' },
  { id: 'st-5', name: 'Carpla Service - CN Hà Nội' },
  { id: 'st-6', name: 'Trạm cứu hộ Long Biên' },
  { id: 'st-7', name: 'Trạm cứu hộ Hải Phòng' },
  { id: 'st-11', name: 'Trạm cứu hộ Đà Nẵng' },
  { id: 'st-14', name: 'Trạm cứu hộ Nha Trang' },
  { id: 'st-16', name: 'Trạm cứu hộ Quận 1' },
  { id: 'st-17', name: 'Carpla Service - CN Hồ Chí Minh' },
  { id: 'st-18', name: 'Garage 24h Thủ Đức' },
];

export const MOCK_RESCUE_VEHICLES: RescueVehicleOption[] = [
  { id: 'v1', plate: '29C-12345', type: 'Xe cẩu bánh vòng' },
  { id: 'v2', plate: '30H-88776', type: 'Xe cẩu sàn' },
  { id: 'v3', plate: '51G-55443', type: 'Xe kéo móc' },
  { id: 'v4', plate: '43A-22110', type: 'Xe tiếp nhiên liệu' },
];
