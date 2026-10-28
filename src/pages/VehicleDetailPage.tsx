import React from 'react';
import { ChevronLeft, FileText, ImagePlus, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DlsBrandButton,
  DlsHomeIndicator,
  DlsLabel,
  DlsNeutralButton,
  DlsSelectField,
  DlsSheetHeader,
  DlsStatusBadge,
  DlsTextField,
} from '@dls/components';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';
import { MOCK_QUOTE_DRIVERS } from '../data/mockQuoteResources';
import {
  addRepairRequest,
  ASSIGNMENT_LABEL,
  assignmentOf,
  DEFAULT_REPAIR_PART_GROUP,
  DEFAULT_REPAIR_PRIORITY,
  DriverVehicle,
  formatOdo,
  VehicleAlert,
  VehicleDoc,
  getDriverVehicle,
  REPAIR_PART_GROUPS,
  REPAIR_PRIORITIES,
  REPAIR_STATUS_LABEL,
  RepairRequest,
  repairRequestsOf,
  RUN_STATUS_LABEL,
  updateVehicleSupplement,
  vehicleAlerts,
} from '../data/driverVehicles';

const MAX_PHOTOS = 4;
const PHOTO_LABELS = ['Góc trước', 'Góc sau', 'Bên trái', 'Bên phải'];

type DetailTab = 'info' | 'maint' | 'docs' | 'tools';

const sectionAlerts = (vehicle: DriverVehicle, labels: string[]) =>
  vehicleAlerts(vehicle).filter((alert) => labels.some((label) => alert.text.startsWith(label)));

const AlertChips: React.FC<{ alerts: VehicleAlert[] }> = ({ alerts }) =>
  alerts.length === 0 ? null : (
    <div className="drv-alert-chips">
      {alerts.map((alert) => (
        <span key={alert.text} className={`drv-alert-chip drv-alert-chip--${alert.level}`}>
          {alert.text}
        </span>
      ))}
    </div>
  );

const driverName = (id: string | null) =>
  MOCK_QUOTE_DRIVERS.find((driver) => driver.id === id)?.name ?? 'Chưa gán';

const shown = (value?: string) => (value && value.trim() ? value : '—');

const sizeText = (...parts: string[]) => {
  const filled = parts.filter((part) => part.trim());
  return filled.length ? `${filled.join(' × ')} mm` : '—';
};

const kgPair = (tk: string, cp: string) => {
  if (!tk && !cp) return '—';
  return `TK ${tk || '—'} · CP ${cp || '—'}`;
};

const Fact: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </div>
);

const VehicleProfile: React.FC<{
  vehicle: DriverVehicle;
  tab: DetailTab;
  requests: RepairRequest[];
  onOpenPhoto: (url: string) => void;
  onOpenDoc: (doc: VehicleDoc) => void;
}> = ({ vehicle, tab, requests, onOpenPhoto, onOpenDoc }) => {
  const specs = vehicle.specs;
  if (tab === 'info') {
    return (
      <>
        <section className="drv-detail-block" aria-labelledby="vehicle-identity">
          <h2 id="vehicle-identity">Thông tin xe</h2>
          <p className="drv-detail-type">
            {vehicle.type}
            {vehicle.brand ? ` · ${vehicle.brand} ${vehicle.modelLine}` : ''}
          </p>
          <h3>Định danh</h3>
          <dl className="drv-vehicle-facts">
            <Fact label="Hãng xe" value={shown(vehicle.brand)} />
            <Fact label="Dòng xe" value={shown(vehicle.modelLine)} />
            <Fact label="Năm sản xuất" value={shown(specs.year)} />
            <Fact label="Số khung" value={shown(specs.chassis)} />
            <Fact label="Số máy" value={shown(specs.engineNo)} />
            <Fact label="Sở hữu" value={shown(specs.ownership)} />
            <Fact label="Nhiên liệu" value={shown(specs.fuel)} />
            <Fact label="Ngày đăng ký" value={shown(specs.registrationDate)} />
          </dl>
          <h3>Vòng đời và pháp lý</h3>
          <dl className="drv-vehicle-facts">
            <Fact label="Niên hạn sử dụng" value={shown(specs.nienHan)} />
            <Fact label="Cải hoán" value={specs.caiHoan ? 'Có' : 'Không'} />
            {specs.caiHoan && <Fact label="Số GCN cải hoán" value={shown(specs.caiHoanGcn)} />}
            <Fact label="Kinh doanh vận tải" value={specs.kdvtYes ? 'Có' : 'Không'} />
            <Fact label="Hiệu lực đăng kiểm" value={shown(specs.inspectionValidUntil)} />
          </dl>
          <h3>Kích thước</h3>
          <dl className="drv-vehicle-facts">
            <Fact label="Kích thước bao" value={sizeText(specs.outerLengthMm, specs.outerWidthMm, specs.outerHeightMm)} />
            <Fact label="Lòng sàn" value={sizeText(specs.deckLengthMm, specs.deckWidthMm)} />
            <Fact label="Công thức bánh xe" value={shown(specs.wheelFormula)} />
            <Fact label="Số người cho phép chở" value={shown(specs.seats)} />
          </dl>
          <h3>Khối lượng (kg)</h3>
          <dl className="drv-vehicle-facts">
            <Fact label="Khối lượng bản thân" value={kgPair(specs.weightTkKg, specs.weightCpKg)} />
            <Fact label="Hàng chuyên chở" value={kgPair(specs.cargoTkKg, specs.cargoCpKg)} />
            <Fact label="Kéo theo" value={kgPair(specs.towTkKg, specs.towCpKg)} />
            <Fact label="Toàn bộ" value={kgPair(specs.totalTkKg, specs.totalCpKg)} />
          </dl>
        </section>
        <section className="drv-detail-block" aria-labelledby="vehicle-cap">
          <h2 id="vehicle-cap">Năng lực cứu hộ</h2>
          <h3>Năng lực cứu hộ</h3>
          <ChipList values={specs.rescueCapabilities} empty="Chưa khai báo" />
          <h3>Nhận xe</h3>
          <ChipList values={specs.acceptedVehicles} empty="Chưa khai báo" />
        </section>
        <section className="drv-detail-block" aria-labelledby="vehicle-ops">
          <h2 id="vehicle-ops">Vận hành và tài xế</h2>
          <dl className="drv-vehicle-facts">
            <Fact label="Trạm" value={shown(vehicle.station)} />
            <Fact label="Tài xế chính" value={driverName(vehicle.primaryDriverId)} />
            <Fact label="Tài xế phụ" value={driverName(vehicle.secondaryDriverId)} />
            <Fact label="Vị trí đỗ" value={shown(vehicle.parkAddress)} />
          </dl>
        </section>
        <section className="drv-detail-block" aria-labelledby="vehicle-photos">
          <h2 id="vehicle-photos">Hình ảnh</h2>
          {vehicle.photos.length === 0 ? (
            <p className="drv-detail-empty">Chưa có ảnh. Góc trước, góc sau, bên trái, bên phải.</p>
          ) : (
            <div className="drv-photo-grid">
              {vehicle.photos.map((url, index) => (
                <button key={url} type="button" className="drv-photo-grid__item" onClick={() => onOpenPhoto(url)}>
                  <img src={url} alt={PHOTO_LABELS[index] || 'Ảnh xe'} />
                  <span>{PHOTO_LABELS[index] || 'Ảnh xe'}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      </>
    );
  }
  if (tab === 'maint') {
    return (
      <>
        <section className="drv-detail-block drv-maint" aria-labelledby="vehicle-maint">
          <div className="drv-maint__head">
            <h2 id="vehicle-maint">Bảo dưỡng</h2>
            <AlertChips alerts={sectionAlerts(vehicle, ['Bảo dưỡng'])} />
          </div>
          <div className="drv-maint__grid">
            <div>
              <span>Chu kỳ</span>
              <strong>{specs.maintenanceCycleKm ? `${formatOdo(specs.maintenanceCycleKm)} km` : '—'}</strong>
            </div>
            <div>
              <span>ODO</span>
              <strong>{vehicle.odoKm ? `${formatOdo(vehicle.odoKm)} km` : '—'}</strong>
            </div>
            <div>
              <span>Gần nhất</span>
              <strong>{shown(specs.maintenanceLastAt)}</strong>
            </div>
            <div>
              <span>Tiếp theo</span>
              <strong>{shown(specs.maintenanceNextAt)}</strong>
            </div>
          </div>
        </section>
        <section className="drv-detail-block" aria-labelledby="vehicle-repairs">
          <h2 id="vehicle-repairs">Yêu cầu sửa chữa</h2>
          {requests.length === 0 ? (
            <p className="drv-vehicle-group__empty">Chưa có yêu cầu sửa chữa cho xe này.</p>
          ) : (
            <ul className="drv-repair-list">
              {requests.map((request) => (
                <li key={request.id}>
                  <div className="drv-repair-list__head">
                    <strong>{request.symptom}</strong>
                    <DlsStatusBadge
                      label={REPAIR_STATUS_LABEL[request.status]}
                      variant={
                        request.status === 'pending' ? 'warning' : request.status === 'rejected' ? 'danger' : 'info'
                      }
                    />
                  </div>
                  <p>
                    {request.partGroup} · {request.priority}
                  </p>
                  <p>{request.createdAt}</p>
                  {request.description && <p>{request.description}</p>}
                  {request.rejectReason && <p className="drv-repair-list__reason">Lý do từ chối: {request.rejectReason}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </>
    );
  }
  if (tab === 'docs') {
    return (
      <section className="drv-detail-block drv-detail-block--list" aria-labelledby="vehicle-docs">
        <h2 id="vehicle-docs">Giấy tờ</h2>
        {specs.docs.length === 0 ? (
          <p className="drv-detail-empty">Chưa có giấy tờ.</p>
        ) : (
          <ul className="drv-doc-rows">
            {specs.docs.map((doc) => {
              const due = doc.daysLeft != null && doc.daysLeft <= 30;
              const hard = doc.daysLeft != null && doc.daysLeft < 0;
              return (
                <li key={doc.type}>
                  <button type="button" className="drv-doc-row" onClick={() => onOpenDoc(doc)}>
                    <FileText size={18} aria-hidden />
                    <span className="drv-doc-row__main">
                      <strong>{doc.type}</strong>
                      <span>
                        {doc.number || 'Chưa có số'}
                        {doc.expiryAt ? ` · ${doc.expiryAt}` : ''}
                      </span>
                    </span>
                    {due && (
                      <span className={`drv-alert-chip drv-alert-chip--${hard ? 'hard' : 'warn'}`}>
                        {hard ? `Quá hạn ${Math.abs(doc.daysLeft ?? 0)} ngày` : `Còn ${doc.daysLeft} ngày`}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    );
  }
  const toolOrder = { broken: 0, missing: 1, good: 2 } as const;
  const tools = [...specs.tools].sort((a, b) => toolOrder[a.condition] - toolOrder[b.condition]);
  const broken = specs.tools.filter((tool) => tool.condition === 'broken').length;
  const missing = specs.tools.filter((tool) => tool.condition === 'missing').length;
  const toolLabel = { good: 'Tốt', broken: 'Hỏng', missing: 'Thiếu' } as const;
  return (
    <section className="drv-detail-block drv-detail-block--list" aria-labelledby="vehicle-tools">
      <div className="drv-detail-block__head">
        <h2 id="vehicle-tools">Công cụ</h2>
        {specs.tools.length > 0 && (
          <p className="drv-tool-summary">
            {specs.tools.length} món
            {broken > 0 && <span className="drv-tool-summary--broken">{broken} hỏng</span>}
            {missing > 0 && <span className="drv-tool-summary--missing">{missing} thiếu</span>}
          </p>
        )}
      </div>
      {tools.length === 0 ? (
        <p className="drv-detail-empty">Chưa có danh sách công cụ.</p>
      ) : (
        <ul className="drv-tool-rows">
          {tools.map((tool) => (
            <li key={tool.name} className={`drv-tool-row drv-tool-row--${tool.condition}`}>
              <strong>{tool.name}</strong>
              <span>
                {tool.quantity} {tool.unit}
              </span>
              <em>{toolLabel[tool.condition]}</em>
            </li>
          ))}
        </ul>
      )}
      {vehicle.toolNote && <p className="drv-detail-note">{vehicle.toolNote}</p>}
    </section>
  );
};

const ChipList: React.FC<{ values: string[]; empty: string }> = ({ values, empty }) =>
  values.length === 0 ? (
    <p className="drv-detail-empty">{empty}</p>
  ) : (
    <div className="drv-alert-chips">
      {values.map((value) => (
        <span key={value} className="drv-alert-chip drv-alert-chip--info">
          {value}
        </span>
      ))}
    </div>
  );

const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentDriverId } = useApp();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [vehicle, setVehicle] = React.useState<DriverVehicle | undefined>(() =>
    id ? getDriverVehicle(id) : undefined,
  );
  const [parkAddress, setParkAddress] = React.useState(vehicle?.parkAddress ?? '');
  const [odoKm, setOdoKm] = React.useState(vehicle?.odoKm ?? '');
  const [toolNote, setToolNote] = React.useState(vehicle?.toolNote ?? '');
  const [photos, setPhotos] = React.useState<string[]>(vehicle?.photos ?? []);
  const [odoError, setOdoError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [requests, setRequests] = React.useState<RepairRequest[]>(() =>
    id ? repairRequestsOf(id) : [],
  );
  const [repairOpen, setRepairOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [tab, setTab] = React.useState<DetailTab>('info');
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [docPreview, setDocPreview] = React.useState<VehicleDoc | null>(null);
  const [priority, setPriority] = React.useState<string>(DEFAULT_REPAIR_PRIORITY);
  const [partGroup, setPartGroup] = React.useState<string>(DEFAULT_REPAIR_PART_GROUP);
  const [symptom, setSymptom] = React.useState('');
  const [description, setDescription] = React.useState('');

  const role = vehicle ? assignmentOf(vehicle, currentDriverId) : null;

  React.useEffect(() => {
    const next = id ? getDriverVehicle(id) : undefined;
    setVehicle(next);
    setParkAddress(next?.parkAddress ?? '');
    setOdoKm(next?.odoKm ?? '');
    setToolNote(next?.toolNote ?? '');
    setPhotos(next?.photos ?? []);
    setRequests(id ? repairRequestsOf(id) : []);
    setNotice('');
    setOdoError('');
    setEditOpen(false);
  }, [id]);

  const openEdit = () => {
    if (!vehicle) return;
    setParkAddress(vehicle.parkAddress);
    setOdoKm(vehicle.odoKm);
    setToolNote(vehicle.toolNote);
    setPhotos([...vehicle.photos]);
    setOdoError('');
    setEditOpen(true);
  };

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_PHOTOS - photos.length;
    const next = [...photos];
    Array.from(files)
      .slice(0, room)
      .forEach((file) => {
        if (!file.type.startsWith('image/')) return;
        next.push(URL.createObjectURL(file));
      });
    setPhotos(next);
  };

  const saveSupplement = () => {
    if (!vehicle) return;
    const digits = odoKm.replace(/\D/g, '');
    if (odoKm.trim() && !digits) {
      setOdoError('ODO chỉ gồm chữ số.');
      return;
    }
    setOdoError('');
    const saved = updateVehicleSupplement(vehicle.id, {
      parkAddress: parkAddress.trim(),
      odoKm: digits,
      toolNote: toolNote.trim(),
      photos,
    });
    if (saved) setVehicle(saved);
    setOdoKm(digits);
    setEditOpen(false);
    setNotice('Đã lưu thông tin xe.');
  };

  const submitRepair = () => {
    if (!vehicle || !symptom.trim()) return;
    const created = addRepairRequest({
      vehicleId: vehicle.id,
      priority,
      partGroup,
      symptom: symptom.trim(),
      description: description.trim(),
    });
    setRequests((prev) => [created, ...prev]);
    setRepairOpen(false);
    setSymptom('');
    setDescription('');
    setPriority(DEFAULT_REPAIR_PRIORITY);
    setPartGroup(DEFAULT_REPAIR_PART_GROUP);
    setTab('maint');
    setNotice('Đã gửi yêu cầu sửa chữa. Trạng thái Chờ duyệt.');
  };

  return (
    <MainShell hideTab>
      <div className="drv-vehicle-page">
        {!vehicle || !role ? (
          <>
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
                <h1>Chi tiết phương tiện</h1>
              </div>
            </header>
            <div className="grab-staff-empty">
              <p>Xe này không nằm trong danh sách được gán cho bạn.</p>
            </div>
          </>
        ) : (
          <>
            <header className="grab-page-header grab-page-header--with-action">
              <div className="grab-page-header__main drv-vehicle-header__main">
                <button
                  type="button"
                  className="drv-vehicle-back"
                  onClick={() => navigate('/settings/vehicles')}
                  aria-label="Quay lại"
                >
                  <ChevronLeft size={24} strokeWidth={2} />
                </button>
                <div>
                  <div className="drv-vehicle-title">
                    <h1>{vehicle.plate}</h1>
                    <span className={`drv-vehicle-status drv-vehicle-status--${vehicle.status}`}>
                      {RUN_STATUS_LABEL[vehicle.status]}
                    </span>
                  </div>
                  <p className="drv-detail-kicker">Mã {vehicle.regCode} · {ASSIGNMENT_LABEL[role]}</p>
                </div>
              </div>
              <div className="drv-detail-header-actions">
                <button type="button" className="drv-detail-edit" onClick={openEdit}>
                  Sửa
                </button>
              </div>
            </header>

            <div className="drv-detail-tabs" role="tablist" aria-label="Mục chi tiết xe">
              {(
                [
                  { id: 'info', label: 'Thông tin' },
                  { id: 'maint', label: 'Bảo dưỡng' },
                  { id: 'docs', label: 'Giấy tờ' },
                  { id: 'tools', label: 'Công cụ' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={`drv-detail-tab${tab === item.id ? ' drv-detail-tab--on' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="drv-vehicle-page__scroll">
              {notice && (
                <p className="drv-vehicle-notice" role="status">
                  {notice}
                </p>
              )}
              <VehicleProfile
                vehicle={vehicle}
                tab={tab}
                requests={requests}
                onOpenPhoto={setPhotoPreview}
                onOpenDoc={setDocPreview}
              />
            </div>

            <div className="drv-vehicle-page__footer">
              <DlsBrandButton onClick={() => setRepairOpen(true)}>Tạo yêu cầu sửa chữa</DlsBrandButton>
            </div>
          </>
        )}
      </div>

      {editOpen && vehicle && (
        <div
          className="dls-sheet-overlay"
          role="dialog"
          aria-modal
          aria-label="Sửa thông tin xe"
          onClick={() => setEditOpen(false)}
        >
          <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
            <DlsSheetHeader title="Sửa thông tin xe" onClose={() => setEditOpen(false)} />
            <div className="dls-sheet-body dls-sheet-body--form">
              <DlsTextField
                label="Vị trí đỗ"
                value={parkAddress}
                onChange={setParkAddress}
                placeholder="Nhập vị trí đỗ xe"
              />
              <DlsTextField
                label="ODO hiện tại (km)"
                value={odoKm}
                onChange={(value) => {
                  setOdoError('');
                  setOdoKm(value.replace(/\D/g, ''));
                }}
                placeholder="Nhập số công tơ mét"
                error={odoError}
              />
              <div className="dls-field">
                <DlsLabel>Tình trạng công cụ</DlsLabel>
                <textarea
                  className="dls-textarea drv-field-note"
                  value={toolNote}
                  onChange={(event) => setToolNote(event.target.value)}
                  placeholder="Ghi công cụ hỏng, thiếu hoặc cần bổ sung"
                />
              </div>
              <div className="dls-field">
                <DlsLabel>Ảnh xe</DlsLabel>
                <div className="drv-vehicle-photos">
                  {photos.map((url) => (
                    <div key={url} className="drv-vehicle-photo">
                      <img src={url} alt="Ảnh xe đã thêm" />
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
                    <button
                      type="button"
                      className="drv-vehicle-photo drv-vehicle-photo--add"
                      onClick={() => fileRef.current?.click()}
                    >
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
                <p className="drv-vehicle-photo-hint">Tối đa {MAX_PHOTOS} ảnh.</p>
              </div>
            </div>
            <div className="dls-sheet-footer">
              <DlsNeutralButton onClick={() => setEditOpen(false)}>Hủy</DlsNeutralButton>
              <DlsBrandButton onClick={saveSupplement}>Lưu</DlsBrandButton>
            </div>
            <DlsHomeIndicator />
          </div>
        </div>
      )}

      {repairOpen && vehicle && (
        <div
          className="dls-sheet-overlay"
          role="dialog"
          aria-modal
          aria-label="Tạo yêu cầu sửa chữa"
          onClick={() => setRepairOpen(false)}
        >
          <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
            <DlsSheetHeader title="Tạo yêu cầu sửa chữa" onClose={() => setRepairOpen(false)} />
            <div className="dls-sheet-body dls-sheet-body--form">
              <div className="drv-repair-lock">
                <span>Phương tiện</span>
                <strong>
                  {vehicle.plate} · {vehicle.type}
                </strong>
              </div>
              <DlsSelectField
                label="Mức độ ưu tiên"
                value={priority}
                options={[...REPAIR_PRIORITIES]}
                onChange={setPriority}
                sheetTitle="Chọn mức độ"
                required
              />
              <DlsSelectField
                label="Nhóm bộ phận gặp sự cố"
                value={partGroup}
                options={[...REPAIR_PART_GROUPS]}
                onChange={setPartGroup}
                sheetTitle="Chọn nhóm bộ phận"
                required
              />
              <DlsTextField
                label="Tên sự cố / Triệu chứng hư hỏng"
                value={symptom}
                onChange={setSymptom}
                placeholder="Mô tả hỏng mà bạn nhìn thấy"
                required
              />
              <div className="dls-field">
                <DlsLabel>Mô tả chi tiết triệu chứng và hiện trường</DlsLabel>
                <textarea
                  className="dls-textarea drv-field-note"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Thời điểm, tiếng kêu, vị trí trên xe"
                />
              </div>
            </div>
            <div className="dls-sheet-footer">
              <DlsNeutralButton onClick={() => setRepairOpen(false)}>Hủy</DlsNeutralButton>
              <DlsBrandButton onClick={submitRepair} disabled={!symptom.trim()}>
                Gửi yêu cầu
              </DlsBrandButton>
            </div>
            <DlsHomeIndicator />
          </div>
        </div>
      )}
      {photoPreview && (
        <div className="drv-viewer" role="dialog" aria-modal aria-label="Xem ảnh xe" onClick={() => setPhotoPreview(null)}>
          <button type="button" className="drv-viewer__close" aria-label="Đóng" onClick={() => setPhotoPreview(null)}>
            <X size={20} />
          </button>
          <img src={photoPreview} alt="Ảnh xe" onClick={(event) => event.stopPropagation()} />
        </div>
      )}

      {docPreview && (
        <div className="drv-viewer" role="dialog" aria-modal aria-label={docPreview.type} onClick={() => setDocPreview(null)}>
          <div className="drv-doc-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="drv-doc-sheet__bar">
              <strong>{docPreview.type}</strong>
              <button type="button" aria-label="Đóng" onClick={() => setDocPreview(null)}>
                <X size={18} />
              </button>
            </div>
            <article className="drv-doc-paper">
              <p className="drv-doc-paper__kind">{docPreview.fileName || docPreview.type}</p>
              <h3>{docPreview.type}</h3>
              <dl>
                <div>
                  <dt>Số</dt>
                  <dd>{docPreview.number || '—'}</dd>
                </div>
                <div>
                  <dt>Ngày cấp</dt>
                  <dd>{docPreview.issuedAt || '—'}</dd>
                </div>
                <div>
                  <dt>Hết hạn</dt>
                  <dd>{docPreview.expiryAt || '—'}</dd>
                </div>
              </dl>
              {docPreview.daysLeft != null && docPreview.daysLeft <= 30 && (
                <span className={`drv-alert-chip drv-alert-chip--${docPreview.daysLeft < 0 ? 'hard' : 'warn'}`}>
                  {docPreview.daysLeft < 0 ? `Quá hạn ${Math.abs(docPreview.daysLeft)} ngày` : `Còn ${docPreview.daysLeft} ngày`}
                </span>
              )}
            </article>
          </div>
        </div>
      )}
      <DlsHomeIndicator />
    </MainShell>
  );
};

export default VehicleDetailPage;
