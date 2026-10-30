import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Check, ChevronDown, ChevronRight, Flag, MapPin, X } from 'lucide-react';
import {
  DlsBrandButton,
  DlsChip,
  DlsHomeIndicator,
  DlsLabel,
  DlsSelectField,
  DlsSheetHeader,
  DlsTextField,
  DlsTopNav,
} from '@dls/components';
import FieldPhotoCapture from '../components/FieldPhotoCapture';
import StationMapPicker from '../components/StationMapPicker';
import { ConfirmDialog } from '../components/DetailRow';
import { useApp } from '../context/AppContext';
import { MOCK_QUOTE_DRIVERS, MOCK_RESCUE_VEHICLES } from '../data/mockQuoteResources';
import { GeoPoint, RescueServiceMode } from '../types';
import { EMPTY_MAP_CENTER } from '../utils/orderMap';

const MAX_PHOTOS = 6;

const SERVICE_KINDS = ['Vận tải', 'Cứu hộ'] as const;
type ServiceKind = (typeof SERVICE_KINDS)[number];

const TRANSPORT_GROUPS = [
  {
    name: 'Vận tải',
    items: ['Chở xe mới', 'Chở cây cối'],
  },
] as const;

const RESCUE_GROUPS = [
  {
    name: 'Cẩu xe',
    items: ['Cẩu xe'],
  },
  {
    name: 'Kéo xe',
    items: ['Kéo xe'],
  },
  {
    name: 'Hỗ trợ tại chỗ',
    items: [
      'Kích bình ắc quy',
      'Kích bình',
      'Vá lốp tại chỗ',
      'Thay lốp dự phòng',
      'Cung cấp nhiên liệu (xăng, dầu, nước làm mát)',
      'Thủy kích',
    ],
  },
] as const;

const SERVICE_GROUPS_BY_KIND: Record<ServiceKind, readonly { name: string; items: readonly string[] }[]> = {
  'Vận tải': TRANSPORT_GROUPS,
  'Cứu hộ': RESCUE_GROUPS,
};

const TOW_SERVICES = new Set(['Cẩu xe', 'Kéo xe']);

const CUSTOMER_TYPES = ['Cá nhân', 'Doanh nghiệp'] as const;
type CustomerType = (typeof CUSTOMER_TYPES)[number];

const DEMO_COMPANIES = [
  'Công ty TNHH Vận tải Hoàng Long',
  'Công ty CP Ô tô Thành Công',
  'Công ty TNHH Logistics Miền Bắc',
  'Doanh nghiệp tư nhân Minh Phát',
  'Công ty TNHH Xe khách Phương Trang',
  'Công ty CP Vận tải biển Việt Nam',
  'Công ty TNHH Thương mại An Bình',
  'Công ty CP Đầu tư Xây dựng Delta',
  'Công ty TNHH Dịch vụ Cơ khí Hà Nội',
  'Công ty CP Nông sản Xanh',
];

const DRIVER_OPTIONS = MOCK_QUOTE_DRIVERS.map((driver) => driver.name);
const VEHICLE_OPTIONS = MOCK_RESCUE_VEHICLES.map((vehicle) => `${vehicle.plate} · ${vehicle.type}`);

interface MediaItem {
  id: string;
  url: string;
  kind: 'image' | 'video';
}

function normalizePlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function distanceKm(from: GeoPoint, to: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function formatDistanceKm(km: number): string {
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  return `${rounded.toLocaleString('vi-VN')} km`;
}

function formatMoneyInput(digits: string): string {
  if (!digits) return '';
  return Number(digits).toLocaleString('vi-VN');
}

async function reverseAddress(point: GeoPoint): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}&accept-language=vi`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('reverse');
    const data = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    const parts = data.address;
    const line = parts
      ? [parts.road, parts.suburb || parts.quarter || parts.neighbourhood, parts.city || parts.town || parts.state]
          .filter(Boolean)
          .join(', ')
      : '';
    return line || data.display_name || `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
  } catch {
    return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
  }
}

const CreateRescueOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { createFieldOrder, driverRole, currentDriverName } = useApp();
  const photosRef = React.useRef<MediaItem[]>([]);
  const submittedRef = React.useRef(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fieldRefs = React.useRef<Partial<Record<string, HTMLElement>>>({});

  const [plate, setPlate] = React.useState('');
  const [customerType, setCustomerType] = React.useState<CustomerType>('Cá nhân');
  const [ownerName, setOwnerName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [incidentPoint, setIncidentPoint] = React.useState<GeoPoint | null>(null);
  const [towPoint, setTowPoint] = React.useState<GeoPoint | null>(null);
  const [picker, setPicker] = React.useState<'incident' | 'tow' | null>(null);
  const [draftPoint, setDraftPoint] = React.useState<GeoPoint | null>(null);
  const [resolving, setResolving] = React.useState(false);
  const [serviceKind, setServiceKind] = React.useState<ServiceKind>('Cứu hộ');
  const [services, setServices] = React.useState<string[]>([]);
  const [serviceOpen, setServiceOpen] = React.useState(false);
  const [condition, setCondition] = React.useState('');
  const [towDestination, setTowDestination] = React.useState('');
  const [photos, setPhotos] = React.useState<MediaItem[]>([]);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const [driverName, setDriverName] = React.useState(currentDriverName);
  const [vehicleLabel, setVehicleLabel] = React.useState('');
  const [odoDigits, setOdoDigits] = React.useState('');
  const [amountDigits, setAmountDigits] = React.useState('');
  const [created, setCreated] = React.useState<{ started: boolean } | null>(null);

  const [plateError, setPlateError] = React.useState<string | undefined>();
  const [phoneError, setPhoneError] = React.useState<string | undefined>();
  const [addressError, setAddressError] = React.useState<string | undefined>();
  const [serviceError, setServiceError] = React.useState<string | undefined>();
  const [photoError, setPhotoError] = React.useState<string | undefined>();
  const [driverError, setDriverError] = React.useState<string | undefined>();
  const [vehicleError, setVehicleError] = React.useState<string | undefined>();
  const [amountError, setAmountError] = React.useState<string | undefined>();

  photosRef.current = photos;

  React.useEffect(
    () => () => {
      if (submittedRef.current) return;
      photosRef.current.forEach((item) => {
        if (item.url.startsWith('blob:')) URL.revokeObjectURL(item.url);
      });
    },
    [],
  );

  const serviceGroups = SERVICE_GROUPS_BY_KIND[serviceKind];
  const serviceNoun = serviceKind === 'Vận tải' ? 'vận tải' : 'cứu hộ';

  const selectServiceKind = (kind: ServiceKind) => {
    if (kind === serviceKind) return;
    setServiceKind(kind);
    setServices([]);
    setServiceError(undefined);
  };

  const toggleService = (name: string) => {
    setServices((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name],
    );
    setServiceError(undefined);
  };

  const addCapturedPhoto = (dataUrl: string) => {
    let full = false;
    setPhotos((prev) => {
      if (prev.length >= MAX_PHOTOS) {
        full = true;
        return prev;
      }
      const next = [
        ...prev,
        {
          id: `shot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          url: dataUrl,
          kind: 'image' as const,
        },
      ];
      full = next.length >= MAX_PHOTOS;
      return next;
    });
    setPhotoError(undefined);
    return full;
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.url.startsWith('blob:')) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.id !== id);
    });
    setPreviewId((current) => (current === id ? null : current));
  };

  const submit = () => {
    const amount = amountDigits ? Number(amountDigits) : 0;
    const nextPlate = plate.trim() ? undefined : 'Nhập biển số xe.';
    const nextPhone = phone.trim() ? undefined : 'Nhập số điện thoại.';
    const nextAddress = address.trim() ? undefined : 'Nhập vị trí sự cố.';
    const nextService = services.length > 0 ? undefined : `Chọn ít nhất một dịch vụ ${serviceNoun}.`;
    const nextDriver = driverName ? undefined : 'Chọn tài xế cứu hộ.';
    const nextVehicle = vehicleLabel ? undefined : 'Chọn xe cứu hộ.';
    const nextAmount = amount > 0 ? undefined : 'Nhập số tiền cứu hộ.';

    setPlateError(nextPlate);
    setPhoneError(nextPhone);
    setAddressError(nextAddress);
    setServiceError(nextService);
    setDriverError(nextDriver);
    setVehicleError(nextVehicle);
    setAmountError(nextAmount);

    const firstMissing = (
      [
        ['plate', nextPlate],
        ['phone', nextPhone],
        ['service', nextService],
        ['address', nextAddress],
        ['driver', nextDriver],
        ['vehicle', nextVehicle],
        ['amount', nextAmount],
      ] as const
    ).find(([, message]) => message);

    if (firstMissing) {
      const node = fieldRefs.current[firstMissing[0]];
      const scroller = scrollRef.current;
      if (node && scroller) {
        const top =
          node.getBoundingClientRect().top -
          scroller.getBoundingClientRect().top +
          scroller.scrollTop -
          12;
        scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
      return;
    }

    const needsTow = serviceKind === 'Cứu hộ' && services.some((name) => TOW_SERVICES.has(name));
    const serviceMode: RescueServiceMode =
      needsTow || towDestination.trim() ? 'Cẩu kéo' : 'Hỗ trợ tại chỗ';
    const driver = MOCK_QUOTE_DRIVERS.find((item) => item.name === driverName);
    const vehicle = MOCK_RESCUE_VEHICLES.find(
      (item) => `${item.plate} · ${item.type}` === vehicleLabel,
    );

    submittedRef.current = true;
    const result = createFieldOrder({
      plate: plate.trim(),
      brand: '',
      model: '',
      address,
      towDestination: towDestination.trim() || undefined,
      serviceMode,
      condition: condition.trim(),
      customerName: ownerName.trim(),
      customerType: customerType === 'Doanh nghiệp' ? 'doanh-nghiep' : 'ca-nhan',
      customerPhone: phone.trim(),
      services,
      incidentPhotos: photos.map((item) => item.url),
      pickupCoords: incidentPoint ?? undefined,
      towCoords: towPoint ?? undefined,
      rescueDriverId: driver?.id,
      rescueDriverName: driver?.name,
      rescueVehiclePlate: vehicle?.plate,
      estimatedTotal: amount,
      startOdoKm: odoDigits || undefined,
      orderLine: serviceKind === 'Vận tải' ? 'van-tai' : 'cuu-ho',
    });
    setCreated({ started: result.started });
  };

  const openPicker = (target: 'incident' | 'tow') => {
    setDraftPoint(target === 'incident' ? incidentPoint : towPoint);
    setPicker(target);
  };

  const confirmPick = async () => {
    if (!picker || !draftPoint) return;
    setResolving(true);
    const label = await reverseAddress(draftPoint);
    if (picker === 'incident') {
      setIncidentPoint(draftPoint);
      setAddress(label);
      setAddressError(undefined);
    } else {
      setTowPoint(draftPoint);
      setTowDestination(label);
    }
    setResolving(false);
    setPicker(null);
  };

  const finish = () => {
    if (created?.started && driverRole !== 'quote-only') {
      navigate('/home', { replace: true });
      return;
    }
    const line = serviceKind === 'Vận tải' ? 'van-tai' : 'cuu-ho';
    const query = line === 'van-tai' ? 'line=van-tai' : 'line=cuu-ho&channel=noi-bo';
    navigate(`/manage?${query}`, { replace: true });
  };

  if (picker) {
    const pickerTitle = picker === 'incident' ? 'Vị trí sự cố' : 'Điểm kéo xe về';
    return (
      <div className="dm-screen req-form">
        <header className="grab-staff-hero">
          <DlsTopNav title={pickerTitle} onBack={() => setPicker(null)} />
        </header>
        <StationMapPicker
          className="req-form__map-full"
          value={draftPoint}
          onChange={setDraftPoint}
          hint="Chạm trên bản đồ để chọn vị trí"
          searchable
        />
        <footer className="req-form__footer">
          <DlsBrandButton onClick={confirmPick} disabled={!draftPoint || resolving}>
            {resolving ? 'Đang lấy địa chỉ...' : 'Chọn vị trí này'}
          </DlsBrandButton>
        </footer>
      </div>
    );
  }

  return (
    <div className="dm-screen req-form">
      <header className="grab-staff-hero">
        <DlsTopNav title="Tạo yêu cầu cứu hộ" onBack={() => navigate('/manage')} />
      </header>
      <div className="dm-scroll-area" ref={scrollRef}>
        <div className="req-form__sections">
          <section className="grab-staff-form-card" aria-labelledby="req-section-customer">
            <div className="grab-staff-form-card__title">
              <h2 id="req-section-customer">Thông tin khách hàng</h2>
            </div>
            <div className="grab-staff-form-grid">
              <div className="dls-field">
                <DlsLabel>Loại khách hàng</DlsLabel>
                <div className="req-form__kind" role="radiogroup" aria-label="Loại khách hàng">
                  {CUSTOMER_TYPES.map((type) => {
                    const on = customerType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className={`req-form__kind-btn${on ? ' req-form__kind-btn--on' : ''}`}
                        onClick={() => {
                          if (type === customerType) return;
                          setCustomerType(type);
                          setOwnerName('');
                        }}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                ref={(node) => {
                  fieldRefs.current.plate = node ?? undefined;
                }}
              >
                <DlsTextField
                  label="Biển số xe"
                  value={plate}
                  onChange={(value) => {
                    setPlate(normalizePlate(value));
                    if (plateError) setPlateError(undefined);
                  }}
                  placeholder="VD: 30A12345"
                  required
                  error={plateError}
                />
              </div>
              {customerType === 'Doanh nghiệp' ? (
                <DlsSelectField
                  label="Tên doanh nghiệp"
                  value={ownerName}
                  options={DEMO_COMPANIES}
                  onChange={setOwnerName}
                  placeholder="Chọn doanh nghiệp"
                  sheetTitle="Tên doanh nghiệp"
                />
              ) : (
                <DlsTextField
                  label="Tên chủ xe"
                  value={ownerName}
                  onChange={setOwnerName}
                  placeholder="VD: Nguyễn Thu Trang"
                />
              )}
              <div
                ref={(node) => {
                  fieldRefs.current.phone = node ?? undefined;
                }}
              >
                <DlsTextField
                  label="Số điện thoại"
                  value={phone}
                  onChange={(value) => {
                    setPhone(value);
                    if (phoneError) setPhoneError(undefined);
                  }}
                  placeholder="VD: 0981234567"
                  required
                  error={phoneError}
                />
              </div>
            </div>
          </section>

          <section className="grab-staff-form-card" aria-labelledby="req-section-scene">
            <div className="grab-staff-form-card__title">
              <h2 id="req-section-scene">Thông tin dịch vụ</h2>
            </div>
            <div className="grab-staff-form-grid">
              <div className="dls-field">
                <DlsLabel>Loại dịch vụ</DlsLabel>
                <div className="req-form__kind" role="radiogroup" aria-label="Loại dịch vụ">
                  {SERVICE_KINDS.map((kind) => {
                    const on = serviceKind === kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className={`req-form__kind-btn${on ? ' req-form__kind-btn--on' : ''}`}
                        onClick={() => selectServiceKind(kind)}
                      >
                        {kind}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div
                className="dls-field"
                ref={(node) => {
                  fieldRefs.current.service = node ?? undefined;
                }}
              >
                <DlsLabel required>{serviceKind === 'Vận tải' ? 'Dịch vụ vận tải' : 'Dịch vụ cứu hộ'}</DlsLabel>
                <button
                  type="button"
                  className={`dls-select-trigger${services.length ? '' : ' dls-select-trigger--placeholder'}`}
                  onClick={() => setServiceOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={serviceOpen}
                >
                  <span>{services.length ? 'Chọn thêm dịch vụ' : 'Chọn dịch vụ'}</span>
                  <ChevronDown size={18} strokeWidth={2} aria-hidden />
                </button>
                {services.length > 0 && (
                  <div className="dls-chip-wrap" aria-label="Dịch vụ đã chọn">
                    {services.map((name) => (
                      <DlsChip
                        key={name}
                        label={name}
                        brand
                        selected
                        icon={<X size={14} strokeWidth={2.5} />}
                        onClick={() => toggleService(name)}
                      />
                    ))}
                  </div>
                )}
                {serviceError && (
                  <p className="dls-field-error" role="alert">
                    {serviceError}
                  </p>
                )}
              </div>
              <div
                className="dls-field"
                ref={(node) => {
                  fieldRefs.current.address = node ?? undefined;
                }}
              >
                <div className="req-form__stops">
                  <button type="button" className="req-form__stop" onClick={() => openPicker('incident')}>
                    <span className="req-form__stop-icon req-form__stop-icon--from" aria-hidden>
                      <MapPin size={16} strokeWidth={2.25} />
                    </span>
                    <span className="req-form__stop-copy">
                      <span className="req-form__stop-label">
                        Vị trí sự cố
                        <span className="dls-required">*</span>
                      </span>
                      <span className="req-form__stop-line">
                        <span className={address ? 'req-form__stop-value' : 'req-form__stop-placeholder'}>
                          {address || 'Chọn trên bản đồ'}
                        </span>
                        {incidentPoint && (
                          <span className="mission-task-card__distance">
                            {formatDistanceKm(distanceKm(EMPTY_MAP_CENTER, incidentPoint))}
                          </span>
                        )}
                      </span>
                    </span>
                    <ChevronRight size={18} className="req-form__stop-chevron" aria-hidden />
                  </button>
                  <button type="button" className="req-form__stop" onClick={() => openPicker('tow')}>
                    <span className="req-form__stop-icon req-form__stop-icon--to" aria-hidden>
                      <Flag size={15} strokeWidth={2.25} />
                    </span>
                    <span className="req-form__stop-copy">
                      <span className="req-form__stop-label">Điểm kéo xe về</span>
                      <span className="req-form__stop-line">
                        <span className={towDestination ? 'req-form__stop-value' : 'req-form__stop-placeholder'}>
                          {towDestination || 'Không bắt buộc'}
                        </span>
                        {incidentPoint && towPoint && (
                          <span className="mission-task-card__distance mission-task-card__distance--tow">
                            {formatDistanceKm(distanceKm(incidentPoint, towPoint))}
                          </span>
                        )}
                      </span>
                    </span>
                    <ChevronRight size={18} className="req-form__stop-chevron" aria-hidden />
                  </button>
                </div>
                {addressError && (
                  <p className="dls-field-error" role="alert">
                    {addressError}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="grab-staff-form-card" aria-labelledby="req-section-photos">
            <div className="grab-staff-form-card__title">
              <h2 id="req-section-photos">Thông tin hiện trường</h2>
            </div>
            <div className="grab-staff-form-grid">
              <div className="dls-field">
                <DlsLabel>Mô tả tình trạng xe</DlsLabel>
                <textarea
                  className="dls-textarea req-form__note"
                  value={condition}
                  onChange={(event) => setCondition(event.target.value)}
                  placeholder="VD: Lốp trước bên phải bị nổ, không có lốp dự phòng..."
                  rows={4}
                />
              </div>
              <div className="dls-field">
                <DlsLabel>Hình ảnh hiện trường</DlsLabel>
                <p className="dls-auth-hint req-form__photo-hint">Có thể bỏ qua. Tối đa {MAX_PHOTOS} ảnh.</p>
                <div className="req-form__photos">
                  <button
                    type="button"
                    className="req-form__camera"
                    onClick={() => {
                      if (photos.length >= MAX_PHOTOS) {
                        setPhotoError(`Tối đa ${MAX_PHOTOS} ảnh.`);
                        return;
                      }
                      setCameraOpen(true);
                    }}
                  >
                    <Camera size={20} strokeWidth={1.75} />
                    <span>
                      {photos.length}/{MAX_PHOTOS}
                    </span>
                  </button>
                  {photos.map((item) => (
                    <div key={item.id} className="req-form__photo">
                      <button
                        type="button"
                        className="req-form__photo-open"
                        aria-label="Xem ảnh"
                        onClick={() => setPreviewId(item.id)}
                      >
                        {item.kind === 'video' ? <video src={item.url} muted /> : <img src={item.url} alt="" />}
                      </button>
                      <button type="button" aria-label="Xóa ảnh" onClick={() => removePhoto(item.id)}>
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
                {photoError && (
                  <p className="dls-field-error" role="alert">
                    {photoError}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="grab-staff-form-card" aria-labelledby="req-section-crew">
            <div className="grab-staff-form-card__title">
              <h2 id="req-section-crew">Thông tin cứu hộ</h2>
            </div>
            <div className="grab-staff-form-grid">
              <div
                ref={(node) => {
                  fieldRefs.current.driver = node ?? undefined;
                }}
              >
                <DlsSelectField
                  label="Tài xế cứu hộ"
                  value={driverName}
                  options={DRIVER_OPTIONS}
                  onChange={(value) => {
                    setDriverName(value);
                    setDriverError(undefined);
                  }}
                  placeholder="Chọn tài xế"
                  sheetTitle="Tài xế cứu hộ"
                  required
                />
                {driverError && (
                  <p className="dls-field-error" role="alert">
                    {driverError}
                  </p>
                )}
              </div>
              <div
                ref={(node) => {
                  fieldRefs.current.vehicle = node ?? undefined;
                }}
              >
                <DlsSelectField
                  label="Xe cứu hộ"
                  value={vehicleLabel}
                  options={VEHICLE_OPTIONS}
                  onChange={(value) => {
                    setVehicleLabel(value);
                    setVehicleError(undefined);
                  }}
                  placeholder="Chọn xe cứu hộ"
                  sheetTitle="Xe cứu hộ"
                  required
                />
                {vehicleError && (
                  <p className="dls-field-error" role="alert">
                    {vehicleError}
                  </p>
                )}
              </div>
              <DlsTextField
                label="ODO (km)"
                value={odoDigits}
                onChange={(value) => setOdoDigits(value.replace(/\D/g, ''))}
                placeholder="Nhập số công tơ mét"
              />
              <div
                ref={(node) => {
                  fieldRefs.current.amount = node ?? undefined;
                }}
              >
                <DlsTextField
                  label="Số tiền cứu hộ (bao gồm thuế)"
                  value={formatMoneyInput(amountDigits)}
                  onChange={(value) => {
                    setAmountDigits(value.replace(/\D/g, ''));
                    if (amountError) setAmountError(undefined);
                  }}
                  placeholder="VD: 1.500.000"
                  required
                  error={amountError}
                />
              </div>
            </div>
          </section>
        </div>
      </div>
      <footer className="req-form__footer">
        <DlsBrandButton onClick={submit}>Tạo yêu cầu cứu hộ</DlsBrandButton>
      </footer>

      {serviceOpen && (
        <div
          className="dls-sheet-overlay"
          role="dialog"
          aria-modal
          aria-label={`Chọn dịch vụ ${serviceNoun}`}
          onClick={() => setServiceOpen(false)}
        >
          <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
            <DlsSheetHeader title={`Chọn dịch vụ ${serviceNoun}`} onClose={() => setServiceOpen(false)} />
            <div className="dls-sheet-body dls-sheet-body--form">
              {serviceGroups.map((group) => (
                <section key={group.name} className="req-form__group" aria-label={group.name}>
                  <p className="dls-label">{group.name}</p>
                  <div className="dls-reason-list">
                    {group.items.map((name) => {
                      const on = services.includes(name);
                      return (
                        <button
                          key={name}
                          type="button"
                          aria-pressed={on}
                          className={`dls-reason-item req-form__service${on ? ' dls-reason-item--on' : ''}`}
                          onClick={() => toggleService(name)}
                        >
                          <span className={`req-form__tick${on ? ' req-form__tick--on' : ''}`} aria-hidden>
                            {on && <Check size={12} strokeWidth={3} />}
                          </span>
                          {name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
            <div className="dls-sheet-footer dls-sheet-footer--single">
              <DlsBrandButton onClick={() => setServiceOpen(false)}>
                Xong{services.length > 0 ? ` (${services.length})` : ''}
              </DlsBrandButton>
            </div>
            <DlsHomeIndicator />
          </div>
        </div>
      )}

      {cameraOpen && (
        <FieldPhotoCapture
          photographer={currentDriverName}
          sceneAddress={address}
          scenePoint={incidentPoint}
          onClose={() => setCameraOpen(false)}
          onCapture={addCapturedPhoto}
        />
      )}

      {previewId && photos.some((item) => item.id === previewId) && (
        <div className="req-form-lightbox" role="dialog" aria-modal aria-label="Xem ảnh" onClick={() => setPreviewId(null)}>
          <button type="button" className="req-form-lightbox__close" aria-label="Đóng" onClick={() => setPreviewId(null)}>
            <X size={22} strokeWidth={2} />
          </button>
          <img
            src={photos.find((item) => item.id === previewId)?.url}
            alt="Ảnh hiện trường"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      <ConfirmDialog
        open={created != null}
        title="Đã tạo yêu cầu cứu hộ"
        message={
          created?.started
            ? 'Yêu cầu đã được ghi nhận và gán cho bạn. Bắt đầu thực hiện cứu hộ trên màn Cứu hộ.'
            : driverName === currentDriverName
              ? 'Yêu cầu đã được ghi nhận. Đơn chưa bắt đầu cứu hộ vì bạn đang có đơn khác hoặc không ở chế độ thực hiện.'
              : `Yêu cầu đã giao cho ${driverName}. Chờ đối tác nhận đơn rồi mới bắt đầu cứu hộ.`
        }
        confirmLabel={created?.started ? 'Thực hiện cứu hộ' : 'Đã hiểu'}
        cancelLabel=""
        onConfirm={finish}
        onCancel={finish}
      />
    </div>
  );
};

export default CreateRescueOrderPage;
