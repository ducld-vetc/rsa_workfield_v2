import React from 'react';
import { ChevronDown, Flag, MapPin } from 'lucide-react';
import { DlsStatusBadge, type DlsStatusVariant } from '@dls/components';
import AddressMapLink from './AddressMapLink';
import RescuePhotosSection from './RescuePhotosSection';
import { isTowQuote, QUOTE_STATUS_LABELS, QuoteOrder, QuoteStatus } from '../types';

function quoteStatusVariant(status: QuoteStatus): DlsStatusVariant {
  if (status === 'tu-choi' || status === 'rejected' || status === 'da-huy') return 'danger';
  if (status === 'het-han' || status === 'cho-bao-gia') return 'warning';
  if (status === 'da-phan-cong') return 'info';
  return 'success';
}

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

const QuoteHistoryRow: React.FC<{ order: QuoteOrder }> = ({ order }) => {
  const [open, setOpen] = React.useState(false);
  const isTow = isTowQuote(order);
  const photos = order.incidentPhotos ?? [];
  const services = order.services?.length ? order.services : [order.serviceName];

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
              label={QUOTE_STATUS_LABELS[order.quoteStatus]}
              variant={quoteStatusVariant(order.quoteStatus)}
              showDot={false}
            />
          </div>
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
              bare
            />
          )}

          <div className="quote-history-row__services">
            <p>Dịch vụ</p>
            <span>{services.join(', ')}</span>
          </div>

          <ul className="rescue-sheet__stops quote-history-row__stops">
            <li className="rescue-sheet__stop">
              <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--pickup" aria-hidden>
                <MapPin size={15} strokeWidth={2.25} />
              </span>
              <div className="rescue-sheet__stop-body">
                <span className="rescue-sheet__stop-label">Điểm cứu hộ · {order.distanceKm} km</span>
                <AddressMapLink address={order.address} />
              </div>
            </li>
            {isTow && order.towDestination && (
              <li className="rescue-sheet__stop">
                <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--tow" aria-hidden>
                  <Flag size={14} strokeWidth={2.25} />
                </span>
                <div className="rescue-sheet__stop-body">
                  <span className="rescue-sheet__stop-label">
                    Kéo đến{order.towKm != null ? ` · ${order.towKm} km` : ''}
                  </span>
                  <AddressMapLink address={order.towDestination} />
                </div>
              </li>
            )}
          </ul>

          {order.quotedDriverName && (
            <p className="quote-history-row__meta">
              {order.quotedDriverName}
              {order.rescueVehiclePlate && ` · ${order.rescueVehiclePlate}`}
            </p>
          )}
        </div>
      )}
    </article>
  );
};

export default QuoteHistoryRow;
