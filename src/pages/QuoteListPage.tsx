import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterIcon } from '@dls/components';
import { EmptyState } from '../components/EmptyState';
import QuoteHistoryRow from '../components/QuoteHistoryRow';
import QuoteInboxPanel, { QuoteSubmitPayload } from '../components/QuoteInboxPanel';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';
import { QUOTE_MANAGE_STATUSES } from '../types';
import {
  countActiveFilterCriteria,
  filterQuoteOrders,
  isFilterActive,
} from '../utils/orderFilter';

type QuoteView = 'pending' | 'sent';

function updatedAtValue(item: { updatedAt?: number; timestamp: string }): number {
  if (typeof item.updatedAt === 'number') return item.updatedAt;
  const match = item.timestamp.match(
    /(\d{1,2}):(\d{2}):(\d{2})[,\s]+(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  );
  if (!match) return 0;
  const [, hh, mm, ss, dd, mo, yyyy] = match;
  return new Date(Number(yyyy), Number(mo) - 1, Number(dd), Number(hh), Number(mm), Number(ss)).getTime();
}

interface QuoteListPageProps {
  onOpenFilter?: () => void;
}

const QuoteListPage: React.FC<QuoteListPageProps> = ({ onOpenFilter }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    quoteOrders,
    demoHasOrders,
    submitQuote,
    skipQuote,
    skippedQuoteIds,
    driverRole,
    appliedQuoteFilter,
    setAppliedQuoteFilter,
    emptyFilter,
  } = useApp();

  const view: QuoteView = searchParams.get('view') === 'sent' ? 'sent' : 'pending';
  const visible = demoHasOrders ? quoteOrders : [];
  const pending = visible.filter(
    (order) => order.quoteStatus === 'cho-bao-gia' && !skippedQuoteIds.includes(order.id),
  );
  const sent = filterQuoteOrders(
    visible.filter((order) => QUOTE_MANAGE_STATUSES.includes(order.quoteStatus)),
    appliedQuoteFilter,
  ).sort((a, b) => updatedAtValue(b) - updatedAtValue(a));
  const filterActive = isFilterActive(appliedQuoteFilter, false);
  const activeFilterCount = countActiveFilterCriteria(appliedQuoteFilter, false);

  const focusId = searchParams.get('order');
  React.useEffect(() => {
    if (!focusId) return;
    const next = new URLSearchParams(searchParams);
    next.delete('order');
    setSearchParams(next, { replace: true });
  }, [focusId, searchParams, setSearchParams]);

  const orderedPending = React.useMemo(() => {
    if (!focusId) return pending;
    const idx = pending.findIndex((order) => order.id === focusId);
    if (idx <= 0) return pending;
    return [pending[idx], ...pending.slice(0, idx), ...pending.slice(idx + 1)];
  }, [pending, focusId]);

  const activeOrder = orderedPending[0];
  const queueRemaining = Math.max(0, orderedPending.length - 1);
  const hasActivePanel = view === 'pending' && demoHasOrders && !!activeOrder;

  const setView = (next: QuoteView) => {
    setSearchParams(next === 'sent' ? { view: 'sent' } : {}, { replace: true });
  };

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
          <header className="quote-inbox-page__header quote-inbox-page__header--row">
            <div>
              <h1>Báo giá</h1>
              <p className="quote-inbox-page__header-sub">
                {view === 'pending'
                  ? pending.length > 0
                    ? `${pending.length} đơn đang chờ bạn báo giá`
                    : 'Hàng chờ đơn cần báo giá'
                  : `${sent.length} báo giá đã xử lý`}
              </p>
            </div>
            {view === 'sent' && onOpenFilter && (
              <button
                type="button"
                className={`grab-page-header__filter${filterActive ? ' grab-page-header__filter--active' : ''}`}
                onClick={onOpenFilter}
                aria-label="Bộ lọc báo giá"
              >
                <FilterIcon />
                {filterActive && (
                  <span className="grab-page-header__filter-badge" aria-hidden>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </header>
          <div className="quote-segment" role="tablist" aria-label="Nhóm báo giá">
            <button
              type="button"
              role="tab"
              aria-selected={view === 'pending'}
              className={`quote-segment__btn ${view === 'pending' ? 'quote-segment__btn--on' : ''}`}
              onClick={() => setView('pending')}
            >
              <span className="quote-segment__label">Chờ báo giá</span>
              {pending.length > 0 && (
                <span className="quote-segment__badge">{pending.length}</span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === 'sent'}
              className={`quote-segment__btn ${view === 'sent' ? 'quote-segment__btn--on' : ''}`}
              onClick={() => setView('sent')}
            >
              <span className="quote-segment__label">Đã báo giá</span>
              {sent.length > 0 && (
                <span className="quote-segment__badge quote-segment__badge--muted">
                  {sent.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {view === 'sent' && filterActive && (
          <div className="grab-activity__filter-bar">
            <p className="grab-activity__filter-summary">
              Đang lọc theo {activeFilterCount} tiêu chí
            </p>
            <button
              type="button"
              className="grab-activity__filter-clear"
              onClick={() => setAppliedQuoteFilter(emptyFilter)}
            >
              Xoá lọc
            </button>
          </div>
        )}

        <div className={`quote-inbox-page__body${view === 'sent' ? ' quote-inbox-page__body--history' : ''}`}>
          {view === 'pending' && !demoHasOrders && (
            <EmptyState
              title="Chưa có đơn mới"
              hint='Bật "Có đơn" ở panel Demo bên ngoài để xem đơn mẫu'
            />
          )}

          {view === 'pending' && demoHasOrders && pending.length === 0 && (
            <EmptyState
              title="Không còn đơn chờ báo giá"
              hint="Đơn mới sẽ hiện tại đây. Báo giá đã gửi nằm ở mục Đã báo giá."
              actionLabel="Xem báo giá đã gửi"
              onAction={() => setView('sent')}
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

          {view === 'sent' && sent.length === 0 && (
            <EmptyState
              title={filterActive ? 'Không có báo giá phù hợp' : 'Chưa có báo giá nào'}
              hint={
                filterActive
                  ? 'Thử đổi thời gian, xe hoặc trạng thái trong bộ lọc.'
                  : 'Sau khi gửi báo giá, đơn sẽ hiện tại đây.'
              }
            />
          )}

          {view === 'sent' && sent.length > 0 && (
            <div className="quote-history-list">
              {sent.map((order) => (
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
