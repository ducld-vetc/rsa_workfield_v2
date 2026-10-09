import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import QuoteInboxPanel, { QuoteSubmitPayload } from '../components/QuoteInboxPanel';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';

const QuoteListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { quoteOrders, demoHasOrders, submitQuote, skipQuote, skippedQuoteIds, driverRole } =
    useApp();

  const visible = demoHasOrders ? quoteOrders : [];
  const pending = visible.filter(
    (o) => o.quoteStatus === 'cho-bao-gia' && !skippedQuoteIds.includes(o.id),
  );

  const focusId = searchParams.get('order');
  React.useEffect(() => {
    if (!focusId) return;
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
  const hasActivePanel = demoHasOrders && !!activeOrder;

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
            <h1>Báo giá cứu hộ</h1>
            <p className="quote-inbox-page__header-sub">
              {pending.length > 0
                ? `${pending.length} đơn đang chờ bạn báo giá`
                : 'Hàng chờ đơn cần báo giá'}
            </p>
          </header>
        </div>

        <div className="quote-inbox-page__body">
          {!demoHasOrders && (
            <EmptyState
              title="Chưa có đơn mới"
              hint='Bật "Có đơn" ở panel Demo bên ngoài để xem đơn mẫu'
            />
          )}

          {demoHasOrders && pending.length === 0 && (
            <EmptyState
              title="Không còn đơn chờ báo giá"
              hint="Đơn mới sẽ hiện tại đây. Các báo giá đã gửi nằm trong mục Đơn."
              actionLabel="Xem đơn đã báo giá"
              onAction={() => navigate('/manage?segment=quoted')}
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
        </div>
      </div>
    </MainShell>
  );
};

export default QuoteListPage;
