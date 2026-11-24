import React from 'react';
import { Building2, Car, ChevronLeft, HandCoins, Landmark, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import { DlsChip, DlsHomeIndicator, FilterIcon } from '@dls/components';
import MainShell from '../layouts/MainShell';
import AdvanceFilterSheet, {
  AdvanceFilterState,
  countAdvanceFilterCriteria,
  EMPTY_ADVANCE_FILTER,
  isAdvanceFilterActive,
} from '../components/AdvanceFilterSheet';
import {
  DRIVER_PAYER_LABEL,
  DRIVER_PURPOSE_LABEL,
  DRIVER_STATUS_LABEL,
  DriverAdvance,
  DriverAdvanceStatus,
  getDriverAdvanceVersion,
  listDriverAdvances,
  subscribeDriverAdvances,
} from '../data/driverAdvances';

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

const STATUS_VIEWS: DriverAdvanceStatus[] = ['pending', 'confirmed', 'rejected'];

const createdAtMs = (value: string) => {
  const [date, time] = value.split(' ');
  const [day, month, year] = date.split('/').map(Number);
  const [hour, minute] = (time ?? '00:00').split(':').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0).getTime();
};

const matchesFilter = (row: DriverAdvance, filter: AdvanceFilterState) => {
  const orderId = filter.orderId.trim().toLowerCase();
  if (orderId && !row.orderId.toLowerCase().includes(orderId)) return false;
  if (filter.purpose && row.purpose !== filter.purpose) return false;
  if (filter.reimburseBy && row.reimburseBy !== filter.reimburseBy) return false;
  if (filter.requester && row.requestedBy !== filter.requester) return false;
  const created = createdAtMs(row.requestedAt);
  if (filter.from) {
    const from = new Date(`${filter.from}T00:00:00`).getTime();
    if (created < from) return false;
  }
  if (filter.to) {
    const to = new Date(`${filter.to}T23:59:59`).getTime();
    if (created > to) return false;
  }
  return true;
};

const AdvanceRow: React.FC<{ row: DriverAdvance; onOpen: () => void }> = ({ row, onOpen }) => {
  const PurposeIcon = row.purpose === 'refund_customer' ? HandCoins : Building2;
  return (
    <button type="button" className="drv-vehicle-row" onClick={onOpen}>
      <span className="drv-vehicle-row__body">
        <span className="drv-vehicle-row__top">
          <span className="drv-vehicle-row__plate">{row.orderId}</span>
          <span className={`drv-vehicle-status drv-vehicle-status--${row.status}`}>
            {DRIVER_STATUS_LABEL[row.status]}
          </span>
        </span>
        <span className="drv-advance-row-line">
          <Car size={14} strokeWidth={2} aria-hidden />
          {row.plate}
        </span>
        <span className="drv-advance-row-line">
          <UserRound size={14} strokeWidth={2} aria-hidden />
          {row.requestedBy}
        </span>
        <span className="drv-advance-row-line">
          <Landmark size={14} strokeWidth={2} aria-hidden />
          Người hoàn ứng · {DRIVER_PAYER_LABEL[row.reimburseBy]}
        </span>
        <span className="drv-advance-row-foot">
          <span className="drv-advance-row-line">
            <PurposeIcon size={14} strokeWidth={2} aria-hidden />
            {DRIVER_PURPOSE_LABEL[row.purpose]}
          </span>
          <span className="drv-advance-row-amount">{formatMoney(row.requestedAmount)}</span>
        </span>
      </span>
    </button>
  );
};

const AdvanceListPage: React.FC = () => {
  const navigate = useNavigate();
  useSyncExternalStore(subscribeDriverAdvances, getDriverAdvanceVersion);
  const rows = listDriverAdvances();
  const [statusView, setStatusView] = React.useState<'all' | DriverAdvanceStatus>('all');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterDraft, setFilterDraft] = React.useState<AdvanceFilterState>(EMPTY_ADVANCE_FILTER);
  const [appliedFilter, setAppliedFilter] = React.useState<AdvanceFilterState>(EMPTY_ADVANCE_FILTER);

  const requesters = React.useMemo(
    () => Array.from(new Set(rows.map((row) => row.requestedBy))),
    [rows],
  );
  const visible = rows.filter((row) => {
    if (statusView !== 'all' && row.status !== statusView) return false;
    return matchesFilter(row, appliedFilter);
  });
  const count = (status: DriverAdvanceStatus) =>
    rows.filter((row) => row.status === status && matchesFilter(row, appliedFilter)).length;
  const filterActive = isAdvanceFilterActive(appliedFilter);
  const activeFilterCount = countAdvanceFilterCriteria(appliedFilter);

  return (
    <MainShell hideTab>
      <div className="drv-vehicle-page">
        <div className="manage-top">
          <header className="grab-page-header grab-page-header--with-action">
            <div className="grab-page-header__main drv-vehicle-header__main">
              <button
                type="button"
                className="drv-vehicle-back"
                onClick={() => navigate('/settings')}
                aria-label="Quay lại"
              >
                <ChevronLeft size={24} strokeWidth={2} />
              </button>
              <h1>Yêu cầu ứng tiền</h1>
            </div>
          </header>
          <div className="manage-smart-filter" role="toolbar" aria-label="Lọc yêu cầu ứng tiền">
            <button
              type="button"
              className={`grab-page-header__filter manage-smart-filter__btn${filterActive ? ' grab-page-header__filter--active' : ''}`}
              onClick={() => {
                setFilterDraft(appliedFilter);
                setFilterOpen(true);
              }}
              aria-label="Bộ lọc yêu cầu ứng tiền"
            >
              <FilterIcon />
              {filterActive && (
                <span className="grab-page-header__filter-badge" aria-hidden>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="manage-smart-filter__chips">
              <DlsChip
                label={`Tất cả ${rows.filter((row) => matchesFilter(row, appliedFilter)).length}`}
                brand
                selected={statusView === 'all'}
                onClick={() => setStatusView('all')}
              />
              {STATUS_VIEWS.map((status) => (
                <DlsChip
                  key={status}
                  label={`${DRIVER_STATUS_LABEL[status]} ${count(status)}`}
                  brand
                  selected={statusView === status}
                  onClick={() => setStatusView(status)}
                />
              ))}
            </div>
          </div>
        </div>

        {filterActive && (
          <div className="grab-activity__filter-bar">
            <p className="grab-activity__filter-summary">
              Đang lọc theo {activeFilterCount} tiêu chí · {visible.length} yêu cầu
            </p>
            <button
              type="button"
              className="grab-activity__filter-clear"
              onClick={() => setAppliedFilter(EMPTY_ADVANCE_FILTER)}
            >
              Xoá lọc
            </button>
          </div>
        )}

        <div className="drv-vehicle-page__scroll">
          {visible.length === 0 ? (
            <p className="drv-vehicle-group__empty drv-vehicle-empty">
              {filterActive ? 'Không tìm thấy yêu cầu phù hợp.' : 'Chưa có yêu cầu ứng tiền.'}
            </p>
          ) : (
            <div className="drv-vehicle-sheet drv-vehicle-sheet--list">
              {visible.map((row) => (
                <AdvanceRow key={row.id} row={row} onOpen={() => navigate(`/advances/${row.id}`)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AdvanceFilterSheet
        open={filterOpen}
        requesters={requesters}
        value={filterDraft}
        onChange={setFilterDraft}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setAppliedFilter(filterDraft);
          setFilterOpen(false);
        }}
        onClear={() => {
          setFilterDraft(EMPTY_ADVANCE_FILTER);
          setAppliedFilter(EMPTY_ADVANCE_FILTER);
          setFilterOpen(false);
        }}
      />
      <DlsHomeIndicator />
    </MainShell>
  );
};

export default AdvanceListPage;
