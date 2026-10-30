import React from 'react';
import { ArrowLeftRight, Camera, ChevronLeft, Clock, Flag, MapPin, Phone, Wrench } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import MissionAssignSheet from '../components/MissionAssignSheet';
import { ConfirmDialog } from '../components/DetailRow';
import ReasonSheet from '../components/ReasonSheet';
import RescueMap from '../components/RescueMap';
import RescuePhotosSection from '../components/RescuePhotosSection';
import AddressMapLink from '../components/AddressMapLink';
import { useApp } from '../context/AppContext';
import {
  DlsHomeIndicator,
  DlsStatusBadge,
} from '@dls/components';
import { RescueOrder, STATUS_LABELS } from '../types';
import {
  canReassignDriver,
  canReassignOrder,
  isMissionOfferedToMe,
  patchAcceptOrder,
  patchAssignOrder,
} from '../utils/orderHandler';
import { MOCK_QUOTE_DRIVERS, MOCK_RESCUE_VEHICLES } from '../data/mockQuoteResources';

const STATUS_VARIANT = {
  'cho-nhan': 'warning',
  'dang-cuu-ho': 'success',
  'hoan-thanh': 'success',
  'tu-choi': 'neutral',
  'huy-don': 'danger',
} as const;

function formatMoney(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function formatOdoKm(value?: string): string {
  const digits = value?.replace(/\D/g, '') ?? '';
  if (!digits) return '—';
  return `${Number(digits).toLocaleString('vi-VN')} km`;
}

function hasTowService(order: RescueOrder): boolean {
  return Boolean(order.towDestination) || /kéo|cẩu/i.test(order.services);
}

function getOrderTotal(order: RescueOrder): number | null {
  if (order.estimatedTotal == null) return null;
  return order.estimatedTotal + (order.extraCost ?? 0) + (order.vat ?? 0);
}

function getEtaLabel(order: RescueOrder): string | null {
  if (order.etaMinutes != null && order.distanceKm != null) {
    return `${order.etaMinutes} phút · ${order.distanceKm} km`;
  }
  if (order.etaTime) return `ETA ${order.etaTime}`;
  return null;
}

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getOrder,
    updateOrder,
    getQuoteOrder,
    driverRole,
    currentDriverId,
    currentDriverName,
    poorConnection,
    enqueueSync,
  } = useApp();
  const order = getOrder(id ?? '');
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [assignOpen, setAssignOpen] = React.useState(false);
  const [assignSuccess, setAssignSuccess] = React.useState<string | null>(null);
  const [editingTow, setEditingTow] = React.useState(false);
  const [towDraft, setTowDraft] = React.useState(order?.towDestination ?? '');

  React.useEffect(() => {
    setTowDraft(order?.towDestination ?? '');
    setEditingTow(false);
  }, [order?.towDestination, order?.id]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/manage');
  };

  if (!order) {
    return (
      <div className="dm-screen">
        <p className="dm-empty">Không tìm thấy đơn.</p>
      </div>
    );
  }

  const isPending = order.status === 'cho-nhan';
  const isActive = order.status === 'dang-cuu-ho';
  const isQuoteOnly = driverRole === 'quote-only';
  const offeredToMe = isMissionOfferedToMe(order, currentDriverId);
  const handlingMine = isActive && order.activeHandlerDriverId === currentDriverId;
  const waitingPartnerName =
    isPending && !offeredToMe ? order.delegatedToDriverName : undefined;
  const canReassign = canReassignDriver(driverRole) && canReassignOrder(order);
  const canEditTow = !isQuoteOnly && (isPending || isActive);
  const hasRescueFooter = !isQuoteOnly && (offeredToMe || handlingMine);
  const hasAssignFooter = isQuoteOnly && canReassign;
  const hasFooter = hasRescueFooter || hasAssignFooter || Boolean(waitingPartnerName);
  const variant = STATUS_VARIANT[order.status];
  const showTow = hasTowService(order);
  const orderTotal = getOrderTotal(order);
  const remaining =
    orderTotal != null ? Math.max(0, orderTotal - (order.depositPaid ?? 0)) : null;
  const towDisplay = order.towDestination?.trim() || 'Chưa có địa chỉ';
  const etaLabel = getEtaLabel(order);
  const quoteIncidentPhotos = order.quoteOrderId
    ? getQuoteOrder(order.quoteOrderId)?.incidentPhotos
    : undefined;
  const rescuePhotos = {
    'hien-truong': order.incidentPhotos ?? quoteIncidentPhotos ?? [],
    'qua-trinh': order.processPhotos ?? [],
    'hoan-tat': order.completionPhotos ?? [],
  };
  const hasRescuePhotos = Object.values(rescuePhotos).some((items) => items.length > 0);
  const serviceLines = order.serviceLines ?? [{ name: order.services, value: '' }];

  const handleAccept = () => {
    if (!isMissionOfferedToMe(order, currentDriverId)) return;
    updateOrder(order.id, {
      ...patchAcceptOrder(order, currentDriverId, currentDriverName),
      acceptCountdown: undefined,
    });
    navigate('/home');
  };

  const handleReject = (reason: string) => {
    updateOrder(order.id, { status: 'tu-choi', acceptCountdown: undefined });
    setRejectOpen(false);
    navigate('/manage');
    void reason;
  };

  const saveTowDestination = () => {
    const trimmed = towDraft.trim();
    updateOrder(order.id, { towDestination: trimmed || undefined });
    setEditingTow(false);
  };

  const cancelTowEdit = () => {
    setTowDraft(order.towDestination ?? '');
    setEditingTow(false);
  };

  const handleAssign = (driverId: string, vehicleId: string, reason: string) => {
    const driver = MOCK_QUOTE_DRIVERS.find((d) => d.id === driverId);
    const vehicle = MOCK_RESCUE_VEHICLES.find((v) => v.id === vehicleId);
    if (!driver) return;

    updateOrder(order.id, {
      ...patchAssignOrder(order, driverId, driver.name),
      delegatedToDriverPhone: driver.phone,
      delegatedVehiclePlate: vehicle?.plate,
      assignChangeReason: reason,
    });
    setAssignOpen(false);
    setAssignSuccess(`${driver.name} · ${vehicle?.plate ?? ''}`);
  };

  return (
    <div className="dm-screen">
      <div className="rescue-live order-detail-live">
        <div className="rescue-live__map order-detail-live__map">
          <RescueMap order={order} />
          {poorConnection && (
            <p className="rescue-live__connection" role="status">
              Kết nối yếu
            </p>
          )}
          <button
            type="button"
            className="grab-job__back"
            onClick={goBack}
            aria-label="Quay lại"
          >
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          {etaLabel && (
            <div className="rescue-map-tools rescue-map-tools--bottom">
              <div className="rescue-live__route-pill order-detail-live__eta">
                <Clock size={14} strokeWidth={2.25} />
                {etaLabel}
              </div>
            </div>
          )}
        </div>

        <div className="rescue-sheet order-detail-sheet">
          <div
            className={`order-detail-sheet__scroll${hasFooter ? '' : ' order-detail-sheet__scroll--tail'}`}
          >
            <div className="rescue-sheet__head">
              <div className="rescue-sheet__identity">
                <h2 className="rescue-sheet__plate">{formatPlateDisplay(order.plate)}</h2>
                <p className="rescue-sheet__vehicle">
                  {order.brand} {order.model}
                </p>
              </div>
              <div className="rescue-sheet__head-aside">
                <DlsStatusBadge label={STATUS_LABELS[order.status]} variant={variant} />
                {isPending && order.acceptCountdown && (
                  <span className="order-detail-countdown">{order.acceptCountdown}</span>
                )}
              </div>
            </div>

            <div className="order-detail-meta">
              <div className="order-detail-meta__item">
                <span className="order-detail-meta__label">Khách hàng</span>
                <span className="order-detail-meta__value">{order.customerName ?? '—'}</span>
              </div>
              <div className="order-detail-meta__item order-detail-meta__item--phone">
                <span className="order-detail-meta__label">Số điện thoại</span>
                {order.customerPhone ? (
                  <div className="order-detail-meta__phone">
                    <span className="order-detail-meta__value">{order.customerPhone}</span>
                    <a
                      className="order-detail-meta__call"
                      href={`tel:${order.customerPhone}`}
                      aria-label="Gọi khách hàng"
                    >
                      <Phone size={14} strokeWidth={2} />
                    </a>
                  </div>
                ) : (
                  <span className="order-detail-meta__value">—</span>
                )}
              </div>
            </div>

            <div className="order-detail-meta" aria-label="ODO">
              <div className="order-detail-meta__item">
                <span className="order-detail-meta__label">ODO bắt đầu</span>
                <span className="order-detail-meta__value">{formatOdoKm(order.startOdoKm)}</span>
              </div>
              <div className="order-detail-meta__item">
                <span className="order-detail-meta__label">ODO kết thúc</span>
                <span className="order-detail-meta__value">{formatOdoKm(order.endOdoKm)}</span>
              </div>
              {order.returnToWorkshop != null && (
                <div className="order-detail-meta__item order-detail-meta__item--wide">
                  <span className="order-detail-meta__label">Kéo về xưởng</span>
                  <span className="order-detail-meta__value">
                    {order.returnToWorkshop ? order.workshopName || '—' : 'Không'}
                  </span>
                </div>
              )}
            </div>

            <div className="order-detail-condition">
              <p className="order-detail-condition__title">
                <Wrench size={14} strokeWidth={2.25} aria-hidden />
                {order.condition ?? '—'}
              </p>
              {order.conditionDescription && (
                <p className="order-detail-condition__desc">{order.conditionDescription}</p>
              )}
            </div>

            {hasRescuePhotos && <RescuePhotosSection photos={rescuePhotos} />}

            <ul className="rescue-sheet__stops">
              <li className="rescue-sheet__stop">
                <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--pickup" aria-hidden>
                  <MapPin size={15} strokeWidth={2.25} />
                </span>
                <div className="rescue-sheet__stop-body">
                  <div className="rescue-sheet__stop-head">
                    <span className="rescue-sheet__stop-label">Điểm cứu hộ</span>
                  </div>
                  <AddressMapLink
                    address={order.address}
                    coords={order.pickupCoords}
                  />
                </div>
              </li>

              {showTow && (
                <li className="rescue-sheet__stop">
                  <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--tow" aria-hidden>
                    <Flag size={14} strokeWidth={2.25} />
                  </span>
                  <div className="rescue-sheet__stop-body">
                    <div className="rescue-sheet__stop-head">
                      <span className="rescue-sheet__stop-label">Kéo đến</span>
                      {canEditTow && (
                        <div className="rescue-sheet__stop-actions">
                          {!editingTow && (
                            <button
                              type="button"
                              className="rescue-sheet__edit-chip"
                              onClick={() => setEditingTow(true)}
                            >
                              Sửa
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {editingTow ? (
                      <div className="order-detail-tow-edit">
                        <textarea
                          className="dls-textarea"
                          value={towDraft}
                          onChange={(e) => setTowDraft(e.target.value)}
                          placeholder="Nhập địa chỉ điểm kéo xe đến..."
                          rows={3}
                          aria-label="Điểm kéo xe đến"
                        />
                        <div className="order-detail-tow-edit__actions">
                          <button
                            type="button"
                            className="rescue-sheet__link-btn"
                            onClick={cancelTowEdit}
                          >
                            Huỷ
                          </button>
                          <button
                            type="button"
                            className="rescue-sheet__link-btn"
                            onClick={saveTowDestination}
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    ) : towDisplay === 'Chưa có địa chỉ' ? (
                      <p>{towDisplay}</p>
                    ) : (
                      <AddressMapLink
                        address={towDisplay}
                        coords={order.towCoords}
                      />
                    )}
                  </div>
                </li>
              )}
            </ul>

            <div className="order-detail-services">
              <p className="order-detail-services__title">Dịch vụ yêu cầu</p>
              {serviceLines.map((s) => (
                <div key={s.name} className="order-detail-services__item">
                  <span>{s.name}</span>
                  {s.value ? <strong>{s.value}</strong> : <span>—</span>}
                </div>
              ))}
            </div>

            <div className="order-detail-cost">
              <p className="order-detail-cost__title">Chi phí</p>
              {orderTotal != null ? (
                <>
                  <div className="order-detail-cost__row">
                    <span>Tiền đã cọc</span>
                    <span>{formatMoney(order.depositPaid ?? 0)}</span>
                  </div>
                  <div className="order-detail-cost__row">
                    <span>Tổng tiền</span>
                    <span>{formatMoney(orderTotal)}</span>
                  </div>
                  <div className="order-detail-cost__remain">
                    <span>Còn lại</span>
                    <span>{formatMoney(remaining ?? 0)}</span>
                  </div>
                </>
              ) : (
                <div className="order-detail-cost__row">
                  <span>Chưa có báo giá</span>
                  <span>—</span>
                </div>
              )}
            </div>
          </div>

          {waitingPartnerName && (
            <div className="order-detail-sheet__footer">
              <p className="dls-alert-inline" role="status">
                Đang chờ {waitingPartnerName} nhận đơn. Chưa thể bắt đầu cứu hộ.
              </p>
            </div>
          )}

          {hasRescueFooter && isPending && (
            <div className="order-detail-sheet__footer">
              <div className="rescue-sheet__actions-row">
                <button
                  type="button"
                  className="rescue-sheet__action-btn rescue-sheet__action-btn--ghost"
                  onClick={() => setRejectOpen(true)}
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  className="grab-btn-accept rescue-sheet__action-btn--primary"
                  onClick={handleAccept}
                >
                  Nhận ngay
                </button>
              </div>
            </div>
          )}

          {hasRescueFooter && isActive && (
            <div className="order-detail-sheet__footer">
              <div className="rescue-sheet__actions-row">
                <button
                  type="button"
                  className="rescue-sheet__action-btn rescue-sheet__action-btn--icon"
                  onClick={() => navigate(`/jobs/${order.id}/camera?type=qua-trinh`)}
                  aria-label="Chụp ảnh cứu hộ"
                >
                  <Camera size={20} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  className="grab-btn-accept rescue-sheet__action-btn--primary"
                  onClick={() => {
                    if (poorConnection) {
                      enqueueSync({
                        kind: 'status',
                        orderId: order.id,
                        label: 'Tiếp tục cứu hộ',
                      });
                    }
                    navigate('/home');
                  }}
                >
                  Tiếp tục cứu hộ
                </button>
              </div>
            </div>
          )}

          {hasAssignFooter && (
            <div className="order-detail-sheet__footer">
              <div className="rescue-sheet__actions-row">
                <button
                  type="button"
                  className="grab-btn-accept rescue-sheet__action-btn--primary"
                  onClick={() => setAssignOpen(true)}
                >
                  <ArrowLeftRight size={18} strokeWidth={1.75} />
                  Đổi tài xế
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <MissionAssignSheet
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        onConfirm={handleAssign}
      />

      {assignSuccess && (
        <ConfirmDialog
          open={assignSuccess != null}
          title="Đã đổi tài xế"
          message={`Nhiệm vụ đã giao cho ${assignSuccess}.`}
          confirmLabel="Đã hiểu"
          cancelLabel=""
          onConfirm={() => setAssignSuccess(null)}
          onCancel={() => setAssignSuccess(null)}
        />
      )}

      <ReasonSheet
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
      <DlsHomeIndicator />
    </div>
  );
};

export default OrderDetailPage;
