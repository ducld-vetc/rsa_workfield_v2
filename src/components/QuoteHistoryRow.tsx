import React from 'react';
import { Building2, Car, ChevronRight, ChevronUp, Flag, Headset, MapPin, RefreshCw, User } from 'lucide-react';
import { isTowQuote, QUOTE_STATUS_LABELS, QuoteOrder, QuoteStatus } from '../types';

type StatusTone = 'info' | 'success' | 'danger' | 'warning';

function quoteStatusTone(status: QuoteStatus): StatusTone {
  if (status === 'tu-choi' || status === 'rejected' || status === 'da-huy') return 'danger';
  if (status === 'het-han' || status === 'cho-bao-gia') return 'warning';
  if (status === 'da-phan-cong') return 'info';
  return 'success';
}

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function formatMoney(value: number): string {
  return `${value.toLocaleString('vi-VN')} đ`;
}

const QuoteHistoryRow: React.FC<{ order: QuoteOrder }> = ({ order }) => {
  const [open, setOpen] = React.useState(false);
  const isTow = isTowQuote(order) && Boolean(order.towDestination);
  const tone = quoteStatusTone(order.quoteStatus);
  const plate = formatPlateDisplay(order.plate);
  const vehicle = `${order.brand} ${order.model}`.trim();
  const rescueVehicle = [
    order.rescueVehiclePlate ? formatPlateDisplay(order.rescueVehiclePlate) : '',
    order.rescueVehicleType ?? '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className={`quote-history-card${open ? ' quote-history-card--open' : ''}`}>
      <button
        type="button"
        className="quote-history-card__head"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <span className="quote-history-card__car" aria-hidden>
          <Car size={18} strokeWidth={2} />
        </span>
        <span className="quote-history-card__identity">
          <strong>{plate}</strong>
          <span>{vehicle}</span>
        </span>
        <span className="quote-history-card__aside">
          <span className={`quote-history-card__status quote-history-card__status--${tone}`}>
            {order.quoteStatus === 'da-phan-cong' && <RefreshCw size={12} strokeWidth={2.25} />}
            {QUOTE_STATUS_LABELS[order.quoteStatus]}
          </span>
          {order.quotedPrice != null && (
            <span className="quote-history-card__amount">{formatMoney(order.quotedPrice)}</span>
          )}
        </span>
        {open ? (
          <ChevronUp size={16} className="quote-history-card__chevron" />
        ) : (
          <ChevronRight size={16} className="quote-history-card__chevron" />
        )}
      </button>

      {open && (
        <div className="quote-history-card__detail">
          <div className="quote-history-card__panel">
            <p className="quote-history-card__addr">
              <MapPin size={14} strokeWidth={2} />
              <span>
                <em>Vị trí sự cố</em>
                {order.address}
              </span>
            </p>
            {isTow && (
              <p className="quote-history-card__addr">
                <Flag size={14} strokeWidth={2} />
                <span>
                  <em>Điểm kéo xe về</em>
                  {order.towDestination}
                </span>
              </p>
            )}
          </div>

          {(order.quotedDriverName || rescueVehicle || order.rescueStationName) && (
            <div className="quote-history-card__assignment">
              {order.quotedDriverName && (
                <p className="quote-history-card__addr">
                  <User size={14} strokeWidth={2} />
                  <span>
                    <em>Tài xế</em>
                    {order.quotedDriverName}
                  </span>
                </p>
              )}
              {rescueVehicle && (
                <p className="quote-history-card__addr">
                  <Car size={14} strokeWidth={2} />
                  <span>
                    <em>Xe cứu hộ</em>
                    {rescueVehicle}
                  </span>
                </p>
              )}
              {order.rescueStationName && (
                <p className="quote-history-card__addr">
                  <Building2 size={14} strokeWidth={2} />
                  <span>
                    <em>Trạm cứu hộ</em>
                    {order.rescueStationName}
                  </span>
                </p>
              )}
            </div>
          )}

          {order.serviceName && (
            <div className="quote-history-card__service">
              <Headset size={16} strokeWidth={2} />
              <span>{order.serviceName}</span>
              <ChevronRight size={16} />
            </div>
          )}
        </div>
      )}
    </article>
  );
};

export default QuoteHistoryRow;
