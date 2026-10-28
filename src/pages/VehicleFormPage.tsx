import React from 'react';
import { ChevronLeft, ImagePlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DlsBrandButton,
  DlsHomeIndicator,
  DlsLabel,
  DlsSelectField,
  DlsTextField,
} from '@dls/components';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';
import {
  ACCEPTED_VEHICLE_OPTIONS,
  addDriverVehicle,
  emptyVehicleSpecs,
  FUEL_OPTIONS,
  OWNERSHIP_OPTIONS,
  plateTaken,
  RESCUE_CAPABILITY_OPTIONS,
  VEHICLE_BRAND_OPTIONS,
  VEHICLE_STATION_OPTIONS,
  VEHICLE_TYPE_OPTIONS,
  VehicleSpecs,
} from '../data/driverVehicles';

const ROLE_OPTIONS = ['Xe chính', 'Xe phụ'];
const MAX_PHOTOS = 4;

const ChoiceGroup: React.FC<{
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="dls-field">
    <DlsLabel>{label}</DlsLabel>
    <div className="drv-choice-grid">
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            className={`drv-choice${on ? ' drv-choice--on' : ''}`}
            aria-pressed={on}
            onClick={() =>
              onChange(on ? value.filter((item) => item !== option) : [...value, option])
            }
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
);

const VehicleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentDriverId } = useApp();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [plate, setPlate] = React.useState('');
  const [role, setRole] = React.useState('Xe chính');
  const [type, setType] = React.useState('');
  const [brand, setBrand] = React.useState('');
  const [modelLine, setModelLine] = React.useState('');
  const [station, setStation] = React.useState('Trạm Hoàng Mai');
  const [year, setYear] = React.useState('');
  const [chassis, setChassis] = React.useState('');
  const [engineNo, setEngineNo] = React.useState('');
  const [ownership, setOwnership] = React.useState('Công ty');
  const [fuel, setFuel] = React.useState('Diesel');
  const [registrationDate, setRegistrationDate] = React.useState('');
  const [caps, setCaps] = React.useState<string[]>([]);
  const [accepted, setAccepted] = React.useState<string[]>([]);
  const [cycleKm, setCycleKm] = React.useState('');
  const [odoKm, setOdoKm] = React.useState('');
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [error, setError] = React.useState('');

  const digits = (value: string) => value.replace(/\D/g, '');

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const next = [...photos];
    Array.from(files).forEach((file) => {
      if (next.length >= MAX_PHOTOS || !file.type.startsWith('image/')) return;
      next.push(URL.createObjectURL(file));
    });
    setPhotos(next);
  };

  const save = () => {
    if (plate.trim().length < 4) {
      setError('Nhập biển số xe.');
      return;
    }
    if (!type) {
      setError('Chọn loại xe.');
      return;
    }
    if (plateTaken(plate)) {
      setError('Biển số này đã có trong danh sách.');
      return;
    }
    const specs: VehicleSpecs = {
      ...emptyVehicleSpecs(),
      year: digits(year),
      chassis: chassis.trim(),
      engineNo: engineNo.trim(),
      ownership,
      fuel,
      registrationDate: registrationDate.trim(),
      rescueCapabilities: caps,
      acceptedVehicles: accepted,
      maintenanceCycleKm: digits(cycleKm),
      maintenanceStatus: '',
      docs: [],
    };
    const created = addDriverVehicle({
      driverId: currentDriverId,
      role: role === 'Xe phụ' ? 'secondary' : 'primary',
      plate,
      type,
      brand,
      modelLine,
      station,
      parkAddress: '',
      odoKm,
      photos,
      specs,
    });
    navigate(`/settings/vehicles/${created.id}`, { replace: true });
  };

  return (
    <MainShell hideTab>
      <div className="drv-vehicle-page">
        <header className="grab-page-header">
          <div className="drv-vehicle-header__main">
            <button
              type="button"
              className="drv-vehicle-back"
              onClick={() => navigate('/settings/vehicles')}
              aria-label="Quay lại"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <div>
              <h1>Thêm phương tiện</h1>
              <p className="drv-detail-kicker">Hồ sơ theo thông tin xe trên CMS</p>
            </div>
          </div>
        </header>

        <div className="drv-vehicle-page__scroll drv-form-scroll">
          {error && (
            <p className="drv-vehicle-notice drv-vehicle-notice--error" role="alert">
              {error}
            </p>
          )}

          <section className="drv-form-section">
            <h2>Định danh</h2>
            <DlsTextField
              label="Biển số xe"
              value={plate}
              onChange={(value) => {
                setError('');
                setPlate(value.toUpperCase());
              }}
              placeholder="VD: 29C-12345"
              required
            />
            <DlsSelectField
              label="Loại xe"
              value={type}
              options={VEHICLE_TYPE_OPTIONS}
              onChange={setType}
              sheetTitle="Chọn loại xe"
              placeholder="Chọn loại xe"
              required
            />
            <DlsSelectField
              label="Hãng xe"
              value={brand}
              options={VEHICLE_BRAND_OPTIONS}
              onChange={setBrand}
              sheetTitle="Chọn hãng xe"
              placeholder="Chọn hãng xe"
            />
            <DlsTextField label="Dòng xe" value={modelLine} onChange={setModelLine} placeholder="VD: 500 Series" />
            <DlsTextField label="Năm sản xuất" value={year} onChange={(value) => setYear(digits(value))} placeholder="VD: 2022" />
            <DlsTextField label="Số khung" value={chassis} onChange={setChassis} placeholder="VD: JALC4B16X07001234" />
            <DlsTextField label="Số máy" value={engineNo} onChange={setEngineNo} placeholder="VD: 4HK1-123456" />
            <DlsSelectField label="Sở hữu" value={ownership} options={OWNERSHIP_OPTIONS} onChange={setOwnership} sheetTitle="Sở hữu" />
            <DlsSelectField label="Nhiên liệu" value={fuel} options={FUEL_OPTIONS} onChange={setFuel} sheetTitle="Nhiên liệu" />
            <DlsTextField label="Ngày đăng ký" value={registrationDate} onChange={setRegistrationDate} placeholder="VD: 15/03/2022" />
            <DlsSelectField
              label="Vai trò của bạn"
              value={role}
              options={ROLE_OPTIONS}
              onChange={setRole}
              sheetTitle="Chọn vai trò"
              required
            />
            <DlsSelectField
              label="Trạm"
              value={station}
              options={VEHICLE_STATION_OPTIONS}
              onChange={setStation}
              sheetTitle="Chọn trạm"
              required
            />
          </section>

          <section className="drv-form-section">
            <h2>Năng lực cứu hộ</h2>
            <ChoiceGroup label="Năng lực cứu hộ" options={RESCUE_CAPABILITY_OPTIONS} value={caps} onChange={setCaps} />
            <ChoiceGroup label="Nhận xe" options={ACCEPTED_VEHICLE_OPTIONS} value={accepted} onChange={setAccepted} />
          </section>

          <section className="drv-form-section">
            <h2>Bảo dưỡng</h2>
            <DlsTextField label="Chu kỳ (km)" value={cycleKm} onChange={(value) => setCycleKm(digits(value))} placeholder="5000" />
            <DlsTextField label="ODO hiện tại (km)" value={odoKm} onChange={(value) => setOdoKm(digits(value))} placeholder="Nhập số công tơ mét" />
          </section>

          <section className="drv-form-section">
            <h2>Hình ảnh</h2>
            <div className="dls-field">
              <div className="drv-vehicle-photos">
                {photos.map((url) => (
                  <div key={url} className="drv-vehicle-photo">
                    <img src={url} alt="Ảnh xe" />
                    <button
                      type="button"
                      aria-label="Xoá ảnh"
                      onClick={() => setPhotos((prev) => prev.filter((item) => item !== url))}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button type="button" className="drv-vehicle-photo drv-vehicle-photo--add" onClick={() => fileRef.current?.click()}>
                    <ImagePlus size={18} />
                    Thêm ảnh
                  </button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(event) => {
                  addPhotos(event.target.files);
                  event.target.value = '';
                }}
              />
              <p className="drv-vehicle-photo-hint">Tối đa {MAX_PHOTOS} ảnh. Góc trước, góc sau, bên trái, bên phải.</p>
            </div>
          </section>
        </div>

        <div className="drv-vehicle-page__footer">
          <DlsBrandButton onClick={save}>Lưu phương tiện</DlsBrandButton>
        </div>
      </div>
      <DlsHomeIndicator />
    </MainShell>
  );
};

export default VehicleFormPage;
