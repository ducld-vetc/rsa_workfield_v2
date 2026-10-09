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

const MAX_PHOTOS = 6;

const SERVICE_GROUPS = [
  {
    name: 'Cẩu xe',
    items: ['Cẩu xe mặt đường', 'Cẩu xe dưới mặt đường', 'Cẩu xe taluy/mương', 'Cẩu xe từ tầng hầm'],
  },
  {
    name: 'Kéo xe',
    items: ['Kéo xe về gara', 'Kéo xe đường dài', 'Kéo xe bằng sàn trượt', 'Kéo xe không giới hạn khoảng cách'],
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

const TOW_GROUPS = new Set(['Cẩu xe', 'Kéo xe']);

const DRIVER_OPTIONS = MOCK_QUOTE_DRIVERS.map((driver) => driver.name);
const VEHICLE_OPTIONS = MOCK_RESCUE_VEHICLES.map((vehicle) => `${vehicle.plate} · ${vehicle.type}`);

interface MediaItem {
  id: string;
  url: string;
  kind: 'image' | 'video';
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

  const [plate, setPlate] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [incidentPoint, setIncidentPoint] = React.useState<GeoPoint | null>(null);
  const [towPoint, setTowPoint] = React.useState<GeoPoint | null>(null);
  const [picker, setPicker] = React.useState<'incident' | 'tow' | null>(null);
  const [draftPoint, setDraftPoint] = React.useState<GeoPoint | null>(null);
  const [resolving, setResolving] = React.useState(false);
  const [services, setServices] = React.useState<string[]>([]);
  const [serviceOpen, setServiceOpen] = React.useState(false);
  const [condition, setCondition] = React.useState('');
  const [towDestination, setTowDestination] = React.useState('');
  const [photos, setPhotos] = React.useState<MediaItem[]>([]);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const [driverName, setDriverName] = React.useState(currentDriverName);
  const [vehicleLabel, setVehicleLabel] = React.useState('');
  const [amountDigits, setAmountDigits] = React.useState('');
  const [created, setCreated] = React.useState<{ started: boolean } | null>(null);

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
    const nextPhone = phone.trim() ? undefined : 'Nhập số điện thoại.';
    const nextAddress = address.trim() ? undefined : 'Nhập vị trí sự cố.';
    const nextService = services.length > 0 ? undefined : 'Chọn ít nhất một dịch vụ cứu hộ.';
    const nextDriver = driverName ? undefined : 'Chọn tài xế cứu hộ.';
    const nextVehicle = vehicleLabel ? undefined : 'Chọn xe cứu hộ.';
    const nextAmount = amount > 0 ? undefined : 'Nhập số tiền cứu hộ.';

    setPhoneError(nextPhone);
    setAddressError(nextAddress);
    setServiceError(nextService);
    setDriverError(nextDriver);
    setVehicleError(nextVehicle);
    setAmountError(nextAmount);

    if (
      nextPhone ||
      nextAddress ||
      nextService ||
      nextDriver ||
      nextVehicle ||
      nextAmount
    ) {
      return;
    }

    const needsTow = SERVICE_GROUPS.some(
      (group) => TOW_GROUPS.has(group.name) && group.items.some((item) => services.includes(item)),
    );
    const serviceMode: RescueServiceMode =
      needsTow || towDestination.trim() ? 'Cẩu kéo' : 'Hỗ trợ tại chỗ';
    const driver = MOCK_QUOTE_DRIVERS.find((item) => item.name === driverName);
    const vehicle = MOCK_RESCUE_VEHICLES.find(
      (item) => `${item.plate} · ${item.type}` === vehicleLabel,
    );

    submittedRef.current = true;
    const result = createFieldOrder({
      plate: plate.trim() || 'Chưa có biển',
      brand: '',
      model: '',
      address,
      towDestination: towDestination.trim() || undefined,
      serviceMode,
      condition: condition.trim(),
      customerName: ownerName.trim(),
      customerPhone: phone.trim(),
      services,
      incidentPhotos: photos.map((item) => item.url),
      pickupCoords: incidentPoint ?? undefined,
      towCoords: towPoint ?? undefined,
      rescueDriverId: driver?.id,
      rescueDriverName: driver?.name,
      rescueVehiclePlate: vehicle?.plate,
      estimatedTotal: amount,
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
    navigate('/manage?segment=rescue', { replace: true });
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
      <div className="dm-scroll-area">
        <div className="req-form__sections">
          <section className="grab-staff-form-card" aria-labelledby="req-section-customer">
            <div className="grab-staff-form-card__title">
              <h2 id="req-section-customer">Thông tin khách hàng</h2>
            </div>
            <div className="grab-staff-form-grid">
              <DlsTextField
                label="Biển số xe"
                value={plate}
                onChange={setPlate}
                placeholder="Để trống nếu xe chưa có biển"
              />
              <DlsTextField
                label="Tên chủ xe"
                value={ownerName}
                onChange={setOwnerName}
                placeholder="VD: Nguyễn Thu Trang"
              />
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
          </section>

          <section className="grab-staff-form-card" aria-labelledby="req-section-scene">
            <div className="grab-staff-form-card__title">
              <h2 id="req-section-scene">Thông tin dịch vụ</h2>
            </div>
            <div className="grab-staff-form-grid">
              <div className="dls-field">
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
                      <span className={address ? 'req-form__stop-value' : 'req-form__stop-placeholder'}>
                        {address || 'Chọn trên bản đồ'}
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
                      <span className={towDestination ? 'req-form__stop-value' : 'req-form__stop-placeholder'}>
                        {towDestination || 'Không bắt buộc'}
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

              <div className="dls-field">
                <DlsLabel required>Dịch vụ cứu hộ</DlsLabel>
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

            </div>
          </section>

          <section className="grab-staff-form-card" aria-labelledby="req-section-crew">
            <div className="grab-staff-form-card__title">
              <h2 id="req-section-crew">Thông tin cứu hộ</h2>
            </div>
            <div className="grab-staff-form-grid">
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
          aria-label="Chọn dịch vụ cứu hộ"
          onClick={() => setServiceOpen(false)}
        >
          <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
            <DlsSheetHeader title="Chọn dịch vụ cứu hộ" onClose={() => setServiceOpen(false)} />
            <div className="dls-sheet-body dls-sheet-body--form">
              {SERVICE_GROUPS.map((group) => (
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
            : 'Yêu cầu đã được ghi nhận và nằm trong Đơn đang cứu hộ.'
        }
        confirmLabel={created?.started ? 'Thực hiện cứu hộ' : 'Xem đơn'}
        cancelLabel=""
        onConfirm={finish}
        onCancel={finish}
      />
    </div>
  );
};

export default CreateRescueOrderPage;
