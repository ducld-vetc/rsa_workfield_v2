import React from 'react';
import { Clock, Flag, MapPin, Wrench } from 'lucide-react';
import { ConfirmDialog } from './DetailRow';
import QuoteSubmitButton from './QuoteSubmitButton';
import RescuePhotosSection from './RescuePhotosSection';
import AddressMapLink from './AddressMapLink';
import {
  MOCK_QUOTE_DRIVERS,
  MOCK_RESCUE_VEHICLES,
} from '../data/mockQuoteResources';
import { formatVndInput, parseVndInput, suggestQuotePrice } from '../utils/quotePrice';
import { DriverRole, isTowQuote, QuoteOrder, SERVICE_MODE_LABELS } from '../types';
import { DlsStatusBadge } from '@dls/components';

export interface QuoteSubmitPayload {
  quotedPrice: number;
  quotedEtaMinutes: number;
  quotedNote: string;
  quotedDriverName: string;
  quotedDriverPhone: string;
  rescueVehiclePlate?: string;
  rescueVehicleType?: string;
}

interface QuoteInboxPanelProps {
  order: QuoteOrder;
  queueRemaining: number;
  driverRole: DriverRole;
  onSubmit: (data: QuoteSubmitPayload) => void;
  onSkip: () => void;
}

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

const FOOTER_EXPAND_AT = 32;
const FOOTER_COLLAPSE_AT = 88;

function syncFooterExpanded(
  scrollEl: HTMLElement,
  expandedRef: React.MutableRefObject<boolean>,
  setFooterExpanded: React.Dispatch<React.SetStateAction<boolean>>,
) {
  const distanceFromBottom =
    scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;

  if (expandedRef.current) {
    if (distanceFromBottom > FOOTER_COLLAPSE_AT) {
      expandedRef.current = false;
      setFooterExpanded(false);
    }
    return;
  }

  if (distanceFromBottom <= FOOTER_EXPAND_AT) {
    expandedRef.current = true;
    setFooterExpanded(true);
  }
}

const QuoteInboxPanel: React.FC<QuoteInboxPanelProps> = ({
  order,
  queueRemaining,
  driverRole,
  onSubmit,
  onSkip,
}) => {
  const isTow = isTowQuote(order);
  const modeLabel = SERVICE_MODE_LABELS[order.serviceMode];
  const showVehicle = driverRole !== 'quote-only';
  const photos = order.incidentPhotos ?? [];
  const suggestedPrice = suggestQuotePrice(order);

  const [price, setPrice] = React.useState('');
  const [etaMinutes, setEtaMinutes] = React.useState('30');
  const [driverId, setDriverId] = React.useState(MOCK_QUOTE_DRIVERS[0]?.id ?? '');
  const [vehicleId, setVehicleId] = React.useState(MOCK_RESCUE_VEHICLES[0]?.id ?? '');
  const [success, setSuccess] = React.useState(false);
  const [skipConfirm, setSkipConfirm] = React.useState(false);
  const [expired, setExpired] = React.useState(false);
  const [extended, setExtended] = React.useState(false);
  const [countdownSeconds, setCountdownSeconds] = React.useState(
    order.quoteCountdownSeconds ?? 0,
  );
  const [footerExpanded, setFooterExpanded] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const scrollRafRef = React.useRef<number | null>(null);
  const footerExpandedRef = React.useRef(false);

  const selectedDriver = MOCK_QUOTE_DRIVERS.find((d) => d.id === driverId);
  const selectedVehicle = MOCK_RESCUE_VEHICLES.find((v) => v.id === vehicleId);

  React.useEffect(() => {
    setPrice(formatVndInput(String(suggestQuotePrice(order))));
    setEtaMinutes('30');
    setDriverId(MOCK_QUOTE_DRIVERS[0]?.id ?? '');
    setVehicleId(MOCK_RESCUE_VEHICLES[0]?.id ?? '');
    setSuccess(false);
    setSkipConfirm(false);
    setExpired(false);
    setExtended(false);
    setCountdownSeconds(order.quoteCountdownSeconds ?? 0);
    footerExpandedRef.current = false;
    setFooterExpanded(false);
  }, [order.id, order.quoteCountdownSeconds, order]);

  React.useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return undefined;

    const syncFooter = () => {
      syncFooterExpanded(scrollEl, footerExpandedRef, setFooterExpanded);
    };

    const onScroll = () => {
      if (scrollRafRef.current != null) return;
      scrollRafRef.current = window.requestAnimationFrame(() => {
        scrollRafRef.current = null;
        syncFooter();
      });
    };

    syncFooter();
    scrollEl.addEventListener('scroll', onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(syncFooter);
    resizeObserver.observe(scrollEl);

    return () => {
      scrollEl.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
      if (scrollRafRef.current != null) {
        window.cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [order.id]);

  const canSubmit =
    parseVndInput(price) > 0 &&
    etaMinutes.trim().length > 0 &&
    !!selectedDriver &&
    (!showVehicle || !!selectedVehicle) &&
    !expired;

  const handlePriceChange = (raw: string) => setPrice(formatVndInput(raw));

  const handleExtend = () => {
    if (extended) return;
    setCountdownSeconds((s) => s + 60);
    setExtended(true);
    setExpired(false);
  };

  const handleSubmit = () => {
    if (!selectedDriver) return;
    onSubmit({
      quotedPrice: parseVndInput(price),
      quotedEtaMinutes: Number(etaMinutes) || 30,
      quotedNote: '',
      quotedDriverName: selectedDriver.name,
      quotedDriverPhone: selectedDriver.phone,
      rescueVehiclePlate: selectedVehicle?.plate,
      rescueVehicleType: selectedVehicle?.type,
    });
    setSuccess(true);
  };

  const showCountdown = countdownSeconds > 0;

  return (
    <div className="quote-inbox-layout">
      <div className="quote-inbox-layout__scroll" ref={scrollRef}>
        <div className="quote-inbox">
          {queueRemaining > 0 && (
            <p className="quote-inbox__queue-hint">
              Sau đơn này còn <strong>{queueRemaining}</strong> đơn trong hàng chờ
            </p>
          )}

          <section className="order-detail-services quote-inbox__rescue-info" aria-label="Thông tin cứu hộ">
            <div className="rescue-sheet__head quote-inbox__rescue-head">
              <div className="rescue-sheet__identity">
                <h2 className="rescue-sheet__plate">{formatPlateDisplay(order.plate)}</h2>
                <p className="rescue-sheet__vehicle">
                  {order.brand} {order.model}
                </p>
              </div>
              <div className="rescue-sheet__head-aside">
                <DlsStatusBadge label={modeLabel} variant="success" showDot={false} />
              </div>
            </div>

            <ul className="rescue-sheet__stops quote-inbox__rescue-stops">
              <li className="rescue-sheet__stop">
                <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--pickup" aria-hidden>
                  <MapPin size={15} strokeWidth={2.25} />
                </span>
                <div className="rescue-sheet__stop-body">
                  <div className="mission-task-card__stop-head">
                    <span className="rescue-sheet__stop-label">Điểm cứu hộ</span>
                    <span className="mission-task-card__distance">{order.distanceKm} km</span>
                  </div>
                  <AddressMapLink address={order.address} />
                </div>
              </li>

              {isTow && order.towDestination && (
                <li className="rescue-sheet__stop">
                  <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--tow" aria-hidden>
                    <Flag size={14} strokeWidth={2.25} />
                  </span>
                  <div className="rescue-sheet__stop-body">
                    <div className="mission-task-card__stop-head">
                      <span className="rescue-sheet__stop-label">Kéo đến</span>
                      {order.towKm != null && (
                        <span className="mission-task-card__distance mission-task-card__distance--tow">
                          {order.towKm} km
                        </span>
                      )}
                    </div>
                    <AddressMapLink address={order.towDestination} />
                  </div>
                </li>
              )}
            </ul>

            {(order.condition || order.conditionDescription) && (
              <div className="order-detail-condition quote-inbox__rescue-condition">
                {order.condition && (
                  <p className="order-detail-condition__title">
                    <Wrench size={14} strokeWidth={2.25} aria-hidden />
                    {order.condition}
                  </p>
                )}
                {order.conditionDescription && (
                  <p className="order-detail-condition__desc">{order.conditionDescription}</p>
                )}
              </div>
            )}

            {photos.length > 0 && (
              <RescuePhotosSection
                photos={{ 'hien-truong': photos }}
                title="Hình ảnh sự cố"
                compact
              />
            )}
          </section>

          <section className="order-detail-services quote-inbox__form" aria-label="Thông tin báo giá">
            <p className="order-detail-services__title">Thông tin báo giá</p>
            <div className="quote-form-field">
              <label className="dls-label">
                Có mặt (phút)<span className="dls-required">*</span>
              </label>
              <div className="quote-input-icon-wrap">
                <Clock size={18} strokeWidth={1.75} />
                <input
                  className="quote-input-icon"
                  inputMode="numeric"
                  value={etaMinutes}
                  onChange={(e) => setEtaMinutes(e.target.value.replace(/\D/g, ''))}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="quote-form-field">
              <label className="dls-label">
                Tài xế báo giá<span className="dls-required">*</span>
              </label>
              <select
                className="quote-select"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
              >
                {MOCK_QUOTE_DRIVERS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} · {d.phone}
                  </option>
                ))}
              </select>
            </div>

            {showVehicle && (
              <div className="quote-form-field quote-form-field--flush">
                <label className="dls-label">
                  Xe cứu hộ<span className="dls-required">*</span>
                </label>
                <select
                  className="quote-select"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                >
                  {MOCK_RESCUE_VEHICLES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate} · {v.type}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </section>
        </div>
      </div>

      <div
        className={`quote-inbox-layout__footer${footerExpanded ? ' quote-inbox-layout__footer--expanded' : ' quote-inbox-layout__footer--collapsed'}`}
      >
        <div className="quote-inbox-footer__meta">
          <div className="quote-inbox-footer__meta-inner">
            <div className="quote-inbox-footer__meta-head">
              <label className="quote-price-footer__label" htmlFor="quote-price-input">
                Giá báo (VNĐ)<span className="dls-required">*</span>
              </label>
              <p className="quote-price-footer__hint">
                Giá gợi ý: {suggestedPrice.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        <div className="quote-inbox-footer__bar">
          <input
            id="quote-price-input"
            className="quote-price-footer__input"
            inputMode="numeric"
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            placeholder="0"
            aria-label="Giá báo VNĐ"
          />

          <div className="quote-inbox-footer__actions rescue-sheet__actions-row quote-footer-actions">
            <button
              type="button"
              className="rescue-sheet__action-btn rescue-sheet__action-btn--ghost quote-footer-actions__skip"
              onClick={() => setSkipConfirm(true)}
              tabIndex={footerExpanded ? 0 : -1}
              aria-hidden={!footerExpanded}
            >
              Bỏ qua
            </button>
            <div className="quote-footer-actions__submit">
              <QuoteSubmitButton
                key={`${order.id}-${countdownSeconds}-${extended}`}
                initialSeconds={showCountdown ? countdownSeconds : 0}
                disabled={!canSubmit}
                onClick={handleSubmit}
                onExpire={() => setExpired(true)}
                canExtend={!extended}
                onExtend={handleExtend}
                label={footerExpanded ? 'Gửi báo giá' : 'Báo giá'}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={skipConfirm}
        title="Bỏ qua đơn này?"
        message="Đơn sẽ được đưa ra khỏi hàng chờ báo giá. Bạn có chắc không?"
        confirmLabel="Bỏ qua"
        cancelLabel="Huỷ"
        danger
        onConfirm={() => {
          setSkipConfirm(false);
          onSkip();
        }}
        onCancel={() => setSkipConfirm(false)}
      />

      <ConfirmDialog
        open={success}
        title="Đã gửi báo giá"
        message={
          driverRole === 'quote-only'
            ? 'Khách hàng sẽ xem xét báo giá của bạn.'
            : 'Đơn chuyển sang tab Hoạt động khi khách chấp nhận.'
        }
        confirmLabel="OK"
        cancelLabel=""
        onConfirm={() => setSuccess(false)}
        onCancel={() => setSuccess(false)}
      />
    </div>
  );
};

export default QuoteInboxPanel;
