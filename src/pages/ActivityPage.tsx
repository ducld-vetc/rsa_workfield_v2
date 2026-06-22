import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FilterIcon } from '@dls/components';
import { EmptyState } from '../components/EmptyState';
import MissionAssignSheet from '../components/MissionAssignSheet';
import MissionTaskCard from '../components/MissionTaskCard';
import ReasonSheet from '../components/ReasonSheet';
import { ConfirmDialog } from '../components/DetailRow';
import ActivityOrderRow from '../components/ActivityOrderRow';
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
  isUnitOrdersView,
  patchAcceptOrder,
  patchAssignOrder,
  patchExpireOrder,
  patchRejectOrder,
} from '../utils/orderHandler';

interface ActivityPageProps {
  onOpenFilter?: () => void;
}

const ActivityPage: React.FC<ActivityPageProps> = ({ onOpenFilter }) => {
  const navigate = useNavigate();
  const {
    orders,
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
  const assignedMissions = filteredOrders.filter((order) =>
    isMissionOfferedToMe(order, currentDriverId),
  );
  const isQuoteOnly = driverRole === 'quote-only';
  const isUnitView = isUnitOrdersView(driverRole);
  const canAssignToOther = canReassignDriver(driverRole);
  const sorted = [...filteredOrders].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const listTitle = isUnitView ? 'Tất cả đơn' : 'Đơn của tôi';
  const filterActive = isFilterActive(appliedFilter, false);
  const activeFilterCount = countActiveFilterCriteria(appliedFilter, false);

  const subtitle = (() => {
    if (!demoHasOrders) return 'Tất cả đơn cứu hộ đã và đang xử lý';
    if (isQuoteOnly) {
      if (filterActive) {
        return `${sorted.length}/${roleOrders.length} đơn phù hợp bộ lọc`;
      }
      return 'Xem đơn của đơn vị · có thể đổi tài xế';
    }
    if (activeJob) return 'Đang xử lý 1 đơn · xem trên tab Cứu hộ';
    if (filterActive) {
      return `${sorted.length}/${roleOrders.length} đơn phù hợp bộ lọc`;
    }
    if (assignedMissions.length > 0) {
      return `${assignedMissions.length} đơn chờ · ${sorted.length} đơn tổng`;
    }
    return 'Tất cả đơn cứu hộ đã và đang xử lý';
  })();

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

  return (
    <MainShell>
      <div className="grab-activity">
        <header className="grab-page-header grab-page-header--with-action">
          <div className="grab-page-header__main">
            <h1>Hoạt động</h1>
            <p>{subtitle}</p>
          </div>
          {onOpenFilter && (
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
        </header>

        {filterActive && (
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

        {!isQuoteOnly && !readyForRescue && (
          <div className="dls-alert-inline mission-home__banner" role="status">
            Bạn đang tạm nghỉ — bật sẵn sàng trong mục Tài khoản khi có thể đi cứu hộ.
          </div>
        )}

        {isQuoteOnly && (
          <div className="dls-alert-inline mission-home__banner mission-home__banner--info" role="status">
            Chế độ chỉ xem — bạn có thể xem đơn của đơn vị và đổi tài xế khi cần.
          </div>
        )}

        <div className="grab-activity__scroll">
          {!isQuoteOnly && assignedMissions.length > 0 && (
            <section className="mission-home__section" aria-label="Nhiệm vụ được giao">
              <div className="mission-home__section-head">
                <h2>Được giao</h2>
                <span className="mission-home__count">{assignedMissions.length}</span>
              </div>
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

          <section className="grab-activity__section" aria-label="Danh sách đơn">
            <div className="mission-home__section-head">
              <h2>{listTitle}</h2>
              {sorted.length > 0 && (
                <span className="mission-home__count">{sorted.length}</span>
              )}
            </div>

            <div className="grab-activity__list">
              {sorted.map((order) => (
                <ActivityOrderRow
                  key={order.id}
                  order={order}
                  onClick={() => openOrder(order)}
                  canAssign={canAssignToOther && canReassignOrder(order)}
                  onAssign={() => setAssignId(order.id)}
                />
              ))}
              {sorted.length === 0 && (
                <EmptyState
                  title={filterActive ? 'Không có đơn phù hợp' : 'Chưa có hoạt động'}
                  hint={
                    filterActive
                      ? 'Thử đổi ngày tạo, biển số hoặc trạng thái trong bộ lọc.'
                      : 'Đơn cứu hộ sẽ hiển thị tại đây sau khi được phân công.'
                  }
                />
              )}
            </div>
          </section>
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
