import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DlsChip, FilterIcon } from '@dls/components';
import { EmptyState } from '../components/EmptyState';
import MissionAssignSheet from '../components/MissionAssignSheet';
import MissionTaskCard from '../components/MissionTaskCard';
import ReasonSheet from '../components/ReasonSheet';
import { AcceptOdoSheet } from '../components/RescueOdoSheet';
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
import { orderLineOf, rescueChannelOf, type OrderLine, type RescueChannel } from '../types';
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

type ManageLine = OrderLine;

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
  const [acceptOdoId, setAcceptOdoId] = React.useState<string | null>(null);

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
  const isQuoteOnly = driverRole === 'quote-only';
  const canAssignToOther = canReassignDriver(driverRole);
  const lineParam = searchParams.get('line');
  const line: 'all' | ManageLine =
    lineParam === 'van-tai' || lineParam === 'cuu-ho' ? lineParam : 'all';
  const channelParam = searchParams.get('channel');
  const channel: 'all' | RescueChannel =
    line === 'cuu-ho' && (channelParam === 'vetc' || channelParam === 'noi-bo')
      ? channelParam
      : 'all';
  const lineOrders = filteredOrders.filter((order) => {
    if (line !== 'all' && orderLineOf(order) !== line) return false;
    if (line === 'cuu-ho' && channel !== 'all' && rescueChannelOf(order) !== channel) return false;
    return true;
  });
  const assignedMissions = lineOrders
    .filter((order) => isMissionOfferedToMe(order, currentDriverId))
    .sort(byUpdatedAtDesc);
  const transportCount = filteredOrders.filter((order) => orderLineOf(order) === 'van-tai').length;
  const vetcCount = filteredOrders.filter(
    (order) => orderLineOf(order) === 'cuu-ho' && rescueChannelOf(order) === 'vetc',
  ).length;
  const internalCount = filteredOrders.filter(
    (order) => orderLineOf(order) === 'cuu-ho' && rescueChannelOf(order) === 'noi-bo',
  ).length;
  const sorted = [...lineOrders].sort(byUpdatedAtDesc);
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
  const filterActive = isFilterActive(appliedFilter, false);
  const activeFilterCount = countActiveFilterCriteria(appliedFilter, false);

  const selectScope = (next: 'all' | 'vetc' | 'noi-bo' | 'van-tai') => {
    if (next === 'all') setSearchParams({}, { replace: true });
    else if (next === 'van-tai') setSearchParams({ line: 'van-tai' }, { replace: true });
    else setSearchParams({ line: 'cuu-ho', channel: next }, { replace: true });
  };

  const confirmAccept = (odoKm: string) => {
    if (!acceptOdoId) return;
    const order = orders.find((item) => item.id === acceptOdoId);
    if (!order) return;
    updateOrder(acceptOdoId, {
      ...patchAcceptOrder(order, currentDriverId, currentDriverName),
      startOdoKm: odoKm,
    });
    setAcceptOdoId(null);
    navigate('/home');
  };

  const tryAccept = (id: string) => {
    if (!readyForRescue) return;
    if (activeJob) {
      setBusyAcceptOpen(true);
      return;
    }
    setAcceptOdoId(id);
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
            </div>
          </header>

          <div className="manage-smart-filter" role="toolbar" aria-label="Lọc loại đơn">
            {onOpenFilter && (
              <button
                type="button"
                className={`grab-page-header__filter manage-smart-filter__btn${filterActive ? ' grab-page-header__filter--active' : ''}`}
                onClick={onOpenFilter}
                aria-label="Bộ lọc đơn"
              >
                <FilterIcon />
                {filterActive && (
                  <span className="grab-page-header__filter-badge" aria-hidden>
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
            <div className="manage-smart-filter__chips">
              <DlsChip
                label="Tất cả"
                brand={line === 'all'}
                selected={line === 'all'}
                onClick={() => selectScope('all')}
              />
              <DlsChip
                label={vetcCount > 0 ? `Cứu hộ VETC ${vetcCount}` : 'Cứu hộ VETC'}
                brand={channel === 'vetc'}
                selected={channel === 'vetc'}
                onClick={() => selectScope('vetc')}
              />
              <DlsChip
                label={internalCount > 0 ? `Cứu hộ nội bộ ${internalCount}` : 'Cứu hộ nội bộ'}
                brand={channel === 'noi-bo'}
                selected={channel === 'noi-bo'}
                onClick={() => selectScope('noi-bo')}
              />
              <DlsChip
                label={transportCount > 0 ? `Vận tải ${transportCount}` : 'Vận tải'}
                brand={line === 'van-tai'}
                selected={line === 'van-tai'}
                onClick={() => selectScope('van-tai')}
              />
            </div>
          </div>
        </div>

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

          {inRescue.length > 0 && (
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

          {processed.length > 0 && (
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

          {rescueEmpty && (
            <EmptyState
              title={
                filterActive
                  ? 'Không có đơn phù hợp'
                  : line === 'van-tai'
                    ? 'Chưa có đơn vận tải'
                    : channel === 'noi-bo'
                      ? 'Chưa có đơn nội bộ'
                      : channel === 'vetc'
                        ? 'Chưa có đơn VETC'
                        : 'Chưa có đơn'
              }
              hint={
                filterActive
                  ? 'Thử đổi ngày tạo, biển số hoặc trạng thái trong bộ lọc.'
                  : 'Đơn sẽ hiện tại đây khi được phân công hoặc khi bạn tạo đơn mới.'
              }
            />
          )}
        </div>
      </div>

      <AcceptOdoSheet
        open={acceptOdoId != null}
        initialOdo={orders.find((item) => item.id === acceptOdoId)?.startOdoKm}
        onClose={() => setAcceptOdoId(null)}
        onConfirm={confirmAccept}
      />

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
