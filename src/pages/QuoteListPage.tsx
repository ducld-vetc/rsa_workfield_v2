import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Flag, MapPin } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import QuoteInboxPanel, { QuoteSubmitPayload } from '../components/QuoteInboxPanel';
import RescuePhotosSection from '../components/RescuePhotosSection';
import AddressMapLink from '../components/AddressMapLink';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';
import { isTowQuote, QuoteOrder, SERVICE_MODE_LABELS } from '../types';
import { DlsStatusBadge } from '@dls/components';

type QuoteSegment = 'cho' | 'da-gui';

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

const QuoteHistoryRow: React.FC<{ order: QuoteOrder }> = ({ order }) => {
  const [open, setOpen] = React.useState(false);
  const isTow = isTowQuote(order);
  const photos = order.incidentPhotos ?? [];

  return (
    <article className={`quote-history-row ${open ? 'quote-history-row--open' : ''}`}>
      <button
        type="button"
        className="quote-history-row__head"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <div className="quote-history-row__head-text">
          <div className="quote-history-row__identity">
            <span className="quote-history-row__plate">{formatPlateDisplay(order.plate)}</span>
            <DlsStatusBadge
              label={SERVICE_MODE_LABELS[order.serviceMode]}
              variant={isTow ? 'info' : 'success'}
            />
          </div>
          <AddressMapLink
            as="span"
            className="quote-history-row__addr"
            address={order.address}
          />
          {order.quotedPrice != null && (
            <p className="quote-history-row__price">
              {order.quotedPrice.toLocaleString('vi-VN')} đ
              {order.quotedEtaMinutes != null && ` · ${order.quotedEtaMinutes} phút`}
            </p>
          )}
        </div>
        <ChevronDown
          size={18}
          className={`quote-history-row__chevron ${open ? 'quote-history-row__chevron--open' : ''}`}
        />
      </button>

      {open && (
        <div className="quote-history-row__detail">
          {photos.length > 0 && (
            <RescuePhotosSection
              photos={{ 'hien-truong': photos }}
              title="Hình ảnh sự cố"
              compact
            />
          )}

          <ul className="rescue-sheet__stops quote-history-row__stops">
            <li className="rescue-sheet__stop">
              <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--pickup" aria-hidden>
                <MapPin size={15} strokeWidth={2.25} />
              </span>
              <div className="rescue-sheet__stop-body">
                <span className="rescue-sheet__stop-label">Điểm cứu hộ</span>
                <AddressMapLink address={order.address} />
                <p className="quote-inbox__stop-meta">{order.distanceKm} km đến điểm sự cố</p>
              </div>
            </li>
            {isTow && order.towDestination && (
              <li className="rescue-sheet__stop">
                <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--tow" aria-hidden>
                  <Flag size={14} strokeWidth={2.25} />
                </span>
                <div className="rescue-sheet__stop-body">
                  <span className="rescue-sheet__stop-label">Kéo đến</span>
                  <AddressMapLink address={order.towDestination} />
                  {order.towKm != null && (
                    <p className="quote-inbox__stop-meta">Kéo xe {order.towKm} km</p>
                  )}
                </div>
              </li>
            )}
          </ul>

          <p className="quote-history-row__meta">
            {order.brand} {order.model}
          </p>
          {order.quotedDriverName && (
            <p className="quote-history-row__meta">
              {order.quotedDriverName}
              {order.rescueVehiclePlate && ` · ${order.rescueVehiclePlate}`}
            </p>
          )}
          {order.quotedNote && (
            <p className="quote-history-row__note">{order.quotedNote}</p>
          )}
        </div>
      )}
    </article>
  );
};

const QuoteListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { quoteOrders, demoHasOrders, submitQuote, skipQuote, skippedQuoteIds, driverRole } = useApp();
  const [segment, setSegment] = React.useState<QuoteSegment>('cho');

  const visible = demoHasOrders ? quoteOrders : [];
  const pending = visible.filter(
    (o) => o.quoteStatus === 'cho-bao-gia' && !skippedQuoteIds.includes(o.id),
  );
  const quoted = visible.filter((o) => o.quoteStatus === 'da-bao-gia');

  const focusId = searchParams.get('order');
  React.useEffect(() => {
    if (!focusId) return;
    setSegment('cho');
    setSearchParams({}, { replace: true });
  }, [focusId, setSearchParams]);

  const orderedPending = React.useMemo(() => {
    if (!focusId) return pending;
    const idx = pending.findIndex((o) => o.id === focusId);
    if (idx <= 0) return pending;
    return [pending[idx], ...pending.slice(0, idx), ...pending.slice(idx + 1)];
  }, [pending, focusId]);

  const activeOrder = orderedPending[0];
  const queueRemaining = Math.max(0, orderedPending.length - 1);
  const hasActivePanel = demoHasOrders && segment === 'cho' && !!activeOrder;

  const handleSubmit = (data: QuoteSubmitPayload) => {
    if (!activeOrder) return;
    submitQuote(activeOrder.id, data);
  };

  const handleSkip = () => {
    if (!activeOrder) return;
    skipQuote(activeOrder.id);
  };

  return (
    <MainShell>
      <div className={`quote-inbox-page ${hasActivePanel ? 'quote-inbox-page--panel' : ''}`}>
        <div className="quote-inbox-page__top">
          <header className="quote-inbox-page__header">
            <h1>Báo giá</h1>
            <p className="quote-inbox-page__header-sub">Quản lý báo giá cứu hộ</p>
          </header>

          <div className="quote-segment" role="tablist" aria-label="Loại đơn báo giá">
            <button
              type="button"
              role="tab"
              aria-selected={segment === 'cho'}
              className={`quote-segment__btn ${segment === 'cho' ? 'quote-segment__btn--on' : ''}`}
              onClick={() => setSegment('cho')}
            >
              <span className="quote-segment__label">Chờ báo giá</span>
              {pending.length > 0 && (
                <span className="quote-segment__badge">{pending.length}</span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={segment === 'da-gui'}
              className={`quote-segment__btn ${segment === 'da-gui' ? 'quote-segment__btn--on' : ''}`}
              onClick={() => setSegment('da-gui')}
            >
              <span className="quote-segment__label">Đã gửi</span>
              {quoted.length > 0 && (
                <span className="quote-segment__badge quote-segment__badge--muted">{quoted.length}</span>
              )}
            </button>
          </div>
        </div>

        <div className="quote-inbox-page__body">
          {!demoHasOrders && (
            <EmptyState
              title="Chưa có đơn mới"
              hint='Bật "Có đơn" ở panel Demo bên ngoài để xem đơn mẫu'
            />
          )}

          {demoHasOrders && segment === 'cho' && pending.length === 0 && (
            <EmptyState
              title="Không còn đơn chờ báo giá"
              hint="Đơn mới sẽ hiện tại đây. Xem các báo giá đã gửi ở tab Đã gửi."
            />
          )}

          {hasActivePanel && (
            <QuoteInboxPanel
              key={activeOrder.id}
              order={activeOrder}
              queueRemaining={queueRemaining}
              driverRole={driverRole}
              onSubmit={handleSubmit}
              onSkip={handleSkip}
            />
          )}

          {demoHasOrders && segment === 'da-gui' && quoted.length === 0 && (
            <EmptyState
              title="Chưa có báo giá nào"
              hint="Các báo giá đã gửi sẽ hiện tại đây."
            />
          )}

          {demoHasOrders && segment === 'da-gui' && quoted.length > 0 && (
            <div className="quote-history-list">
              {quoted.map((order) => (
                <QuoteHistoryRow key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainShell>
  );
};

export default QuoteListPage;
