import React from 'react';
import { ChevronLeft, Cog, Tag } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';
import { DispatchLogEntry, STATUS_LABELS } from '../types';
import { dispatchLogOf, isDispatchPhase, sortDispatchEntries } from '../utils/dispatchLog';
import { isAdminRole } from '../utils/orderHandler';

const ORDER_STATUS_TONE = {
  'cho-nhan': 'wait',
  'dang-cuu-ho': 'ready',
  'hoan-thanh': 'ready',
  'tu-choi': 'bad',
  'huy-don': 'bad',
} as const;

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function entryStatus(entry: DispatchLogEntry): { label: string; tone: 'ok' | 'wait' | 'bad' | 'muted' } {
  if (entry.kind === 'quote' && entry.selected) return { label: 'Chấp nhận', tone: 'ok' };
  if (entry.kind === 'quote') return { label: 'Đã báo', tone: 'muted' };
  if (entry.kind === 'quote-reject' || entry.kind === 'reject') return { label: 'Từ chối', tone: 'bad' };
  if (entry.kind === 'expire') return { label: 'Quá hạn', tone: 'bad' };
  if (entry.kind === 'accept') return { label: 'Đã nhận', tone: 'ok' };
  if (entry.kind === 'transfer') return { label: 'Điều chuyển', tone: 'muted' };
  return { label: 'Chờ nhận', tone: 'wait' };
}

function formatLogTime(at: string): string {
  const match = at.match(/(\d{1,2}):(\d{2})(?::\d{2})?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return at;
  const [, hh, mm, dd, mo, yyyy] = match;
  return `${hh.padStart(2, '0')}:${mm} ${dd.padStart(2, '0')}/${mo.padStart(2, '0')}/${yyyy}`;
}

function extraNote(entry: DispatchLogEntry, statusLabel: string): string | undefined {
  if (!entry.note || entry.note === statusLabel || entry.note === 'Từ chối nhận đơn' || entry.note === 'Chờ nhận') {
    return undefined;
  }
  return entry.note;
}

const LogCard: React.FC<{ entry: DispatchLogEntry; phase: 'quote' | 'execution' }> = ({ entry, phase }) => {
  const status = entryStatus(entry);
  const note = extraNote(entry, status.label);
  const people = [entry.driverName, entry.vehiclePlate].filter(Boolean).join(' · ');

  const time = entry.at ? formatLogTime(entry.at) : '';

  return (
    <li className="order-dispatch-card">
      <div className="order-dispatch-card__top">
        <div className="order-dispatch-card__who">
          <strong>{entry.actor}</strong>
        </div>
        <span className={`order-dispatch-card__pill order-dispatch-card__pill--${status.tone}`}>
          {status.label}
        </span>
      </div>

      {phase === 'quote' && entry.price && (
        <div className="order-dispatch-card__price">
          <span>Giá đề xuất</span>
          <strong>{entry.price}</strong>
        </div>
      )}

      {phase === 'execution' && (entry.driverName || entry.vehiclePlate) && (
        <div className="order-dispatch-card__crew">
          <span>{entry.vehiclePlate ? 'Xe cứu hộ' : 'Người thực hiện'}</span>
          <strong>{entry.vehiclePlate ?? entry.driverName}</strong>
        </div>
      )}

      {(phase === 'quote' && (people || note)) || time ? (
        <div className="order-dispatch-card__foot">
          <div className="order-dispatch-card__meta">
            {phase === 'quote' && people && <p className="order-dispatch-card__aside">{people}</p>}
            {phase === 'quote' && note && <p className="order-dispatch-card__note">{note}</p>}
            {phase === 'execution' && note && <p className="order-dispatch-card__note">{note}</p>}
          </div>
          {time && <time className="order-dispatch-card__time">{time}</time>}
        </div>
      ) : null}
    </li>
  );
};

const DispatchLogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, getQuoteOrder, driverRole } = useApp();
  const order = getOrder(id ?? '');

  if (!isAdminRole(driverRole)) {
    return <Navigate to={id ? `/orders/${id}` : '/manage'} replace />;
  }

  if (!order) {
    return (
      <MainShell hideTab>
        <div className="drv-vehicle-page">
          <header className="grab-page-header">
            <div className="drv-vehicle-header__main">
              <button
                type="button"
                className="drv-vehicle-back"
                onClick={() => navigate('/manage')}
                aria-label="Quay lại"
              >
                <ChevronLeft size={24} strokeWidth={2} />
              </button>
              <h1>Điều phối</h1>
            </div>
          </header>
          <p className="dm-empty">Không tìm thấy đơn.</p>
        </div>
      </MainShell>
    );
  }

  const quote = order.quoteOrderId ? getQuoteOrder(order.quoteOrderId) : undefined;
  const entries = dispatchLogOf(order, quote);
  const quotes = sortDispatchEntries(
    entries.filter((entry) => isDispatchPhase(entry.kind)),
    'quote',
  );
  const execution = sortDispatchEntries(
    entries.filter((entry) => !isDispatchPhase(entry.kind)),
    'execution',
  );

  return (
    <MainShell hideTab>
      <div className="drv-vehicle-page">
        <header className="grab-page-header order-dispatch-header">
          <div className="grab-page-header__main drv-vehicle-header__main">
            <button
              type="button"
              className="drv-vehicle-back"
              onClick={() => navigate(-1)}
              aria-label="Quay lại"
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
            <div className="drv-vehicle-title">
              <h1>{formatPlateDisplay(order.plate)}</h1>
              <span className={`drv-vehicle-status drv-vehicle-status--${ORDER_STATUS_TONE[order.status]}`}>
                {STATUS_LABELS[order.status]}
              </span>
            </div>
          </div>
        </header>

        <div className="drv-vehicle-page__scroll">
          <div className="order-dispatch-page">
            <div className="order-dispatch-rail">
              <section className="order-dispatch-step" aria-label="DISPATCH">
                <h3>
                  <span className="order-dispatch-step__icon order-dispatch-step__icon--quote">
                    <Tag size={13} strokeWidth={2.25} />
                  </span>
                  Báo giá
                </h3>
                {quotes.length === 0 ? (
                  <p className="order-dispatch-step__empty">Chưa có bản ghi.</p>
                ) : (
                  <ol className="order-dispatch-log">
                    {quotes.map((entry) => (
                      <LogCard key={entry.id} entry={entry} phase="quote" />
                    ))}
                  </ol>
                )}
              </section>

              <section className="order-dispatch-step" aria-label="EXECUTION">
                <h3>
                  <span className="order-dispatch-step__icon order-dispatch-step__icon--run">
                    <Cog size={13} strokeWidth={2.25} />
                  </span>
                  Thực hiện
                </h3>
                {execution.length === 0 ? (
                  <p className="order-dispatch-step__empty">Chưa có bản ghi.</p>
                ) : (
                  <ol className="order-dispatch-log">
                    {execution.map((entry) => (
                      <LogCard key={entry.id} entry={entry} phase="execution" />
                    ))}
                  </ol>
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </MainShell>
  );
};

export default DispatchLogPage;
