import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FilterIcon } from '@dls/components';
import { EmptyState } from '../components/EmptyState';
import MissionAssignSheet from '../components/MissionAssignSheet';
import MissionTaskCard from '../components/MissionTaskCard';
import ReasonSheet from '../components/ReasonSheet';
import { ConfirmDialog } from '../components/DetailRow';
import ActivityOrderRow from '../components/ActivityOrderRow';
import QuoteHistoryRow from '../components/QuoteHistoryRow';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';
import {
  MOCK_QUOTE_DRIVERS,
  MOCK_RESCUE_VEHICLES,
} from '../data/mockQuoteResources';
import {
  countActiveFilterCriteria,
  filterOrders,
  isFilterActive,
} from '../utils/orderFilter';
import {
  canReassignDriver,
  canReassignOrder,
  isMissionOfferedToMe,
  isOrderVisibleInActivity,
  patchAcceptOrder,
  patchAssignOrder,
  patchExpireOrder,
  patchRejectOrder,
} from '../utils/orderHandler';

type ManageSegment = 'quoted' | 'rescue';

function updatedAtValue(item: { updatedAt?: number; timestamp: string }): number {
  if (typeof item.updatedAt === 'number') return item.updatedAt;
  const match = item.timestamp.match(
    /(\d{1,2}):(\d{2}):(\d{2})[,\s]+(\d{1,2})\/(\d{1,2})\/(\d{4})/,
  );
  if (!match) return 0;
  const [, hh, mm, ss, dd, mo, yyyy] = match;
  return new Date(Number(yyyy), Number(mo) - 1, Number(dd), Number(hh), Number(mm), Number(ss)).getTime();
}

function byUpdatedAtDesc<T extends { updatedAt?: number; timestamp: string }>(a: T, b: T): number {
  return updatedAtValue(b) - updatedAtValue(a);
}

interface ActivityPageProps {
  onOpenFilter?: () => void;
}

const ActivityPage: React.FC<ActivityPageProps> = ({ onOpenFilter }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    orders,
    quoteOrders,
    readyForRescue,
    updateOrder,
    demoHasOrders,
    driverRole,
    currentDriverId,
    currentDriverName,
    appliedFilter,
    setAppliedFilter,
    emptyFilter,
  } = useApp();

  const [rejectId, setRejectId] = React.useState<string | null>(null);
  const [assignId, setAssignId] = React.useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = React.useState<string | null>(null);
  const [busyAcceptOpen, setBusyAcceptOpen] = React.useState(false);

  const activeJob = orders.find(
    (o) =>
      o.status === 'dang-cuu-ho' &&
      o.activeHandlerDriverId === currentDriverId,
  );
  const roleOrders = demoHasOrders
    ? orders.filter((order) =>
        isOrderVisibleInActivity(order, driverRole, currentDriverId),
      )
    : [];
  const filteredOrders = filterOrders(roleOrders, appliedFilter, {
    includeServiceTypes: false,
  });
  const assignedMissions = filteredOrders
    .filter((order) => isMissionOfferedToMe(order, currentDriverId))
    .sort(byUpdatedAtDesc);
  const isQuoteOnly = driverRole === 'quote-only';
  const canAssignToOther = canReassignDriver(driverRole);
  const showQuoted = driverRole !== 'rescue-only';
  const segment: ManageSegment =
    !showQuoted || searchParams.get('segment') === 'rescue'
      ? 'rescue'
      : searchParams.get('segment') === 'quoted' || isQuoteOnly
        ? 'quoted'
        : 'rescue';
  const sorted = [...filteredOrders].sort(byUpdatedAtDesc);
  const missionIds = new Set(
    isQuoteOnly ? [] : assignedMissions.map((order) => order.id),
  );
  const inRescue = sorted.filter(
    (order) =>
      (order.status === 'cho-nhan' || order.status === 'dang-cuu-ho') &&
      !missionIds.has(order.id),
  );
  const processed = sorted.filter(
    (order) => order.status !== 'cho-nhan' && order.status !== 'dang-cuu-ho',
  );
  const quoted = demoHasOrders
    ? quoteOrders
        .filter((order) => order.quoteStatus === 'da-bao-gia' || order.quoteStatus === 'tu-choi')
        .sort(byUpdatedAtDesc)
    : [];
  const filterActive = isFilterActive(appliedFilter, false);
  const activeFilterCount = countActiveFilterCriteria(appliedFilter, false);

  const setSegment = (next: ManageSegment) => {
    setSearchParams(next === 'rescue' ? { segment: 'rescue' } : { segment: 'quoted' }, {
      replace: true,
    });
  };

  const handleAccept = (id: string) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    updateOrder(id, patchAcceptOrder(order, currentDriverId, currentDriverName));
    navigate('/home');
  };

  const tryAccept = (id: string) => {
    if (!readyForRescue) return;
    if (activeJob) {
      setBusyAcceptOpen(true);
      return;
    }
    handleAccept(id);
  };

  const handleReject = (reason: string) => {
    if (rejectId) {
      const order = orders.find((item) => item.id === rejectId);
      if (order) {
        updateOrder(
          rejectId,
          patchRejectOrder(order, currentDriverId, currentDriverName),
        );
      }
      setRejectId(null);
    }
    void reason;
  };

  const handleExpire = (id: string) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    updateOrder(id, patchExpireOrder(order, currentDriverId, currentDriverName));
  };

  const handleAssign = (driverId: string, vehicleId: string, reason: string) => {
    if (!assignId) return;
    const driver = MOCK_QUOTE_DRIVERS.find((d) => d.id === driverId);
    const vehicle = MOCK_RESCUE_VEHICLES.find((v) => v.id === vehicleId);
    if (!driver) return;
    const order = orders.find((item) => item.id === assignId);
    if (!order) return;

    updateOrder(assignId, {
      ...patchAssignOrder(order, driverId, driver.name),
      delegatedToDriverPhone: driver.phone,
      delegatedVehiclePlate: vehicle?.plate,
      assignChangeReason: reason,
    });
    setAssignId(null);
    setAssignSuccess(`${driver.name} · ${vehicle?.plate ?? ''}`);
  };

  const openOrder = (order: (typeof orders)[0]) => {
    navigate(`/orders/${order.id}`);
  };

  const rescueEmpty =
    assignedMissions.length === 0 && inRescue.length === 0 && processed.length === 0;

  return (
    <MainShell>
      <div className="grab-activity">
        <div className="manage-top">
          <header className="grab-page-header grab-page-header--with-action">
            <div className="grab-page-header__main">
              <h1>Quản lý đơn</h1>
            </div>
            <div className="grab-page-header__actions">
              <button
                type="button"
                className="wf-create-btn"
                onClick={() => navigate('/manage/new')}
              >
                <Plus size={16} strokeWidth={2.25} />
                Tạo đơn
              </button>
              {segment === 'rescue' && onOpenFilter && (
                <button
                  type="button"
                  className={`grab-page-header__filter${filterActive ? ' grab-page-header__filter--active' : ''}`}
                  onClick={onOpenFilter}
                  aria-label="Bộ lọc đơn cứu hộ"
                >
                  <FilterIcon />
                  {filterActive && (
                    <span className="grab-page-header__filter-badge" aria-hidden>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </header>

          {showQuoted && (
            <div className="quote-segment" role="tablist" aria-label="Nhóm đơn cứu hộ">
              <button
                type="button"
                role="tab"
                aria-selected={segment === 'quoted'}
                className={`quote-segment__btn ${segment === 'quoted' ? 'quote-segment__btn--on' : ''}`}
                onClick={() => setSegment('quoted')}
              >
                <span className="quote-segment__label">Báo giá</span>
                {quoted.length > 0 && (
                  <span className="quote-segment__badge quote-segment__badge--muted">
                    {quoted.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={segment === 'rescue'}
                className={`quote-segment__btn ${segment === 'rescue' ? 'quote-segment__btn--on' : ''}`}
                onClick={() => setSegment('rescue')}
              >
                <span className="quote-segment__label">Cứu hộ</span>
                {assignedMissions.length + inRescue.length > 0 && (
                  <span className="quote-segment__badge">
                    {assignedMissions.length + inRescue.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {segment === 'rescue' && filterActive && (
          <div className="grab-activity__filter-bar">
            <p className="grab-activity__filter-summary">
              Đang lọc theo {activeFilterCount} tiêu chí
            </p>
            <button
              type="button"
              className="grab-activity__filter-clear"
              onClick={() => setAppliedFilter(emptyFilter)}
            >
              Xoá lọc
            </button>
          </div>
        )}

        {segment === 'rescue' && !isQuoteOnly && !readyForRescue && (
          <div className="dls-alert-inline mission-home__banner" role="status">
            Bạn đang tạm nghỉ — bật sẵn sàng trong mục Tài khoản khi có thể đi cứu hộ.
          </div>
        )}

        {segment === 'rescue' && isQuoteOnly && (
          <div className="dls-alert-inline mission-home__banner mission-home__banner--info" role="status">
            Chế độ chỉ xem — bạn có thể xem đơn của đơn vị và đổi tài xế khi cần.
          </div>
        )}

        <div className="grab-activity__scroll">
          {segment === 'quoted' && quoted.length === 0 && (
            <EmptyState
              title="Chưa có báo giá nào"
              hint="Sau khi gửi báo giá, đơn sẽ hiện tại đây."
              actionLabel={driverRole === 'rescue-only' ? undefined : 'Mở hàng chờ báo giá'}
              onAction={
                driverRole === 'rescue-only' ? undefined : () => navigate('/quotes')
              }
            />
          )}

          {segment === 'quoted' && quoted.length > 0 && (
            <div className="quote-history-list manage-quoted-list">
              {quoted.map((order) => (
                <QuoteHistoryRow key={order.id} order={order} />
              ))}
            </div>
          )}

          {segment === 'rescue' && !isQuoteOnly && assignedMissions.length > 0 && (
            <section className="mission-home__section" aria-label="Nhiệm vụ được giao">
              <div className="mission-home__list">
                {assignedMissions.map((order) => (
                  <MissionTaskCard
                    key={order.id}
                    order={order}
                    canAssign={canAssignToOther}
                    acceptDisabled={!readyForRescue}
                    onAccept={() => tryAccept(order.id)}
                    onReject={() => setRejectId(order.id)}
                    onExpire={() => handleExpire(order.id)}
                    onAssign={() => setAssignId(order.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {segment === 'rescue' && inRescue.length > 0 && (
            <section className="grab-activity__section" aria-label="Đơn đang cứu hộ">
              <div className="grab-activity__list">
                {inRescue.map((order) => (
                  <ActivityOrderRow
                    key={order.id}
                    order={order}
                    onClick={() => openOrder(order)}
                    canAssign={canAssignToOther && canReassignOrder(order)}
                    onAssign={() => setAssignId(order.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {segment === 'rescue' && processed.length > 0 && (
            <section className="grab-activity__section" aria-label="Đơn đã xử lý">
              <div className="grab-activity__list">
                {processed.map((order) => (
                  <ActivityOrderRow
                    key={order.id}
                    order={order}
                    onClick={() => openOrder(order)}
                    canAssign={canAssignToOther && canReassignOrder(order)}
                    onAssign={() => setAssignId(order.id)}
                  />
                ))}
              </div>
            </section>
          )}

          {segment === 'rescue' && rescueEmpty && (
            <EmptyState
              title={filterActive ? 'Không có đơn phù hợp' : 'Chưa có đơn đang cứu hộ'}
              hint={
                filterActive
                  ? 'Thử đổi ngày tạo, biển số hoặc trạng thái trong bộ lọc.'
                  : 'Đơn sẽ hiện tại đây khi được phân công hoặc khi bạn tạo đơn mới.'
              }
            />
          )}
        </div>
      </div>

      <ReasonSheet
        open={rejectId != null}
        title="Lý do từ chối đơn"
        onClose={() => setRejectId(null)}
        onConfirm={handleReject}
      />

      <MissionAssignSheet
        open={assignId != null}
        onClose={() => setAssignId(null)}
        onConfirm={handleAssign}
      />

      <ConfirmDialog
        open={assignSuccess != null}
        title="Đã phân công"
        message={`Nhiệm vụ đã giao cho ${assignSuccess}. Bạn không cần nhận đơn này.`}
        confirmLabel="Đã hiểu"
        cancelLabel=""
        onConfirm={() => setAssignSuccess(null)}
        onCancel={() => setAssignSuccess(null)}
      />

      <ConfirmDialog
        open={busyAcceptOpen}
        title="Đang xử lý đơn khác"
        message={
          activeJob
            ? `Bạn đang cứu hộ đơn ${activeJob.plate}. Hoàn thành hoặc bàn giao đơn hiện tại trước khi nhận nhiệm vụ mới.`
            : 'Bạn đang xử lý một đơn cứu hộ khác.'
        }
        confirmLabel="Đã hiểu"
        cancelLabel=""
        onConfirm={() => setBusyAcceptOpen(false)}
        onCancel={() => setBusyAcceptOpen(false)}
      />
    </MainShell>
  );
};

export default ActivityPage;
