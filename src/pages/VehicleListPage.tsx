import React from 'react';
import { ChevronLeft, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DlsChip, DlsHomeIndicator, FilterIcon } from '@dls/components';
import MainShell from '../layouts/MainShell';
import VehicleFilterSheet, {
  countVehicleFilterCriteria,
  EMPTY_VEHICLE_FILTER,
  isVehicleFilterActive,
  VehicleDriverOption,
  VehicleFilterState,
} from '../components/VehicleFilterSheet';
import VehicleLookupSheet, { emptyLookupDraft, VehicleLookupDraft } from '../components/VehicleLookupSheet';
import { useApp } from '../context/AppContext';
import {
  DriverVehicle,
  pendingRepairCount,
  RUN_STATUS_LABEL,
  VEHICLE_RUN_STATUSES,
  VehicleRunStatus,
  vehicleAlerts,
  vehiclesForDriver,
} from '../data/driverVehicles';
import { MOCK_QUOTE_DRIVERS } from '../data/mockQuoteResources';
import { findFreeVehicles, formatLookupWhen } from '../utils/vehicleLookup';

type StatusView = 'all' | VehicleRunStatus;

const formatKm = (km: number) => (km >= 10 ? `${Math.round(km)} km` : `${km.toFixed(1)} km`);

const VehicleRow: React.FC<{ vehicle: DriverVehicle; distanceKm?: number; onOpen: () => void }> = ({
  vehicle,
  distanceKm,
  onOpen,
}) => {
  const station = vehicle.station.replace(/^Trạm\s+/, '');
  const alerts = vehicleAlerts(vehicle);
  const hasWarning = alerts.length > 0 || pendingRepairCount(vehicle.id) > 0;
  const warningLevel = alerts.some((alert) => alert.level === 'hard') ? 'hard' : 'warn';
  return (
    <button type="button" className="drv-vehicle-row" onClick={onOpen}>
      <span className="drv-vehicle-row__body">
        <span className="drv-vehicle-row__top">
          <span className="drv-vehicle-row__identity">
            <span className="drv-vehicle-row__plate">{vehicle.plate}</span>
            <span className="drv-vehicle-row__code">{vehicle.regCode}</span>
          </span>
          <span className={`drv-vehicle-status drv-vehicle-status--${vehicle.status}`}>
            {RUN_STATUS_LABEL[vehicle.status]}
          </span>
        </span>
        <span className="drv-vehicle-row__meta">
          {vehicle.type}
          {station ? ` · ${station}` : ''}
          {distanceKm != null ? ` · ${formatKm(distanceKm)}` : ''}
        </span>
        {hasWarning && (
          <span className="drv-alert-chips">
            <span className={`drv-alert-chip drv-alert-chip--${warningLevel}`}>Cảnh báo</span>
          </span>
        )}
      </span>
    </button>
  );
};

const matchesQuery = (vehicle: DriverVehicle, query: string) => {
  if (!query) return true;
  const compact = query.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!compact) return true;
  const plate = vehicle.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const chassis = vehicle.specs.chassis.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return plate.includes(compact) || chassis.includes(compact);
};

const VehicleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentDriverId, orders } = useApp();
  const [statusView, setStatusView] = React.useState<StatusView>('all');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [lookupOpen, setLookupOpen] = React.useState(false);
  const [lookupDraft, setLookupDraft] = React.useState<VehicleLookupDraft>(emptyLookupDraft);
  const [lookup, setLookup] = React.useState<VehicleLookupDraft | null>(null);
  const [filterDraft, setFilterDraft] = React.useState<VehicleFilterState>(EMPTY_VEHICLE_FILTER);
  const [appliedFilter, setAppliedFilter] = React.useState<VehicleFilterState>(EMPTY_VEHICLE_FILTER);

  const assigned = React.useMemo(() => vehiclesForDriver(currentDriverId), [currentDriverId]);
  const stations = React.useMemo(
    () => Array.from(new Set(assigned.map((item) => item.station).filter(Boolean))),
    [assigned],
  );
  const keyword = appliedFilter.query.trim();
  const drivers = React.useMemo<VehicleDriverOption[]>(() => {
    const ids = new Set<string>();
    assigned.forEach((vehicle) => {
      if (vehicle.primaryDriverId) ids.add(vehicle.primaryDriverId);
      if (vehicle.secondaryDriverId) ids.add(vehicle.secondaryDriverId);
    });
    return MOCK_QUOTE_DRIVERS.filter((driver) => ids.has(driver.id)).map((driver) => ({
      id: driver.id,
      name: driver.name,
    }));
  }, [assigned]);

  const visible = assigned.filter((vehicle) => {
    if (statusView !== 'all' && vehicle.status !== statusView) return false;
    if (appliedFilter.statuses.length > 0 && !appliedFilter.statuses.includes(vehicle.status)) return false;
    if (appliedFilter.station && vehicle.station !== appliedFilter.station) return false;
    if (appliedFilter.type && vehicle.type !== appliedFilter.type) return false;
    if (
      appliedFilter.driverId &&
      vehicle.primaryDriverId !== appliedFilter.driverId &&
      vehicle.secondaryDriverId !== appliedFilter.driverId
    ) {
      return false;
    }
    return matchesQuery(vehicle, keyword);
  });

  const hits = React.useMemo(() => {
    if (!lookup?.center) return null;
    const from = new Date(lookup.from).getTime();
    const to = new Date(lookup.to).getTime();
    if (!Number.isFinite(from) || !Number.isFinite(to) || to <= from) return null;
    return findFreeVehicles(
      {
        from,
        to,
        radiusKm: lookup.radiusKm,
        center: lookup.center,
        centerLabel: lookup.centerLabel,
      },
      orders,
    );
  }, [lookup, orders]);
  const rows: { vehicle: DriverVehicle; distanceKm?: number }[] = hits
    ? hits.map((hit) => ({ vehicle: hit.vehicle, distanceKm: hit.distanceKm }))
    : visible.map((vehicle) => ({ vehicle }));

  const filterActive = isVehicleFilterActive(appliedFilter);
  const activeFilterCount = countVehicleFilterCriteria(appliedFilter);
  const statusCount = (status: VehicleRunStatus) => assigned.filter((item) => item.status === status).length;
  const chipsRef = React.useRef<HTMLDivElement>(null);
  const chipDrag = React.useRef({ active: false, startX: 0, scroll: 0, moved: false });

  const onChipsPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !chipsRef.current) return;
    chipDrag.current = {
      active: true,
      startX: event.clientX,
      scroll: chipsRef.current.scrollLeft,
      moved: false,
    };
    chipsRef.current.setPointerCapture(event.pointerId);
  };

  const onChipsPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!chipDrag.current.active || !chipsRef.current) return;
    const delta = event.clientX - chipDrag.current.startX;
    if (Math.abs(delta) > 4) chipDrag.current.moved = true;
    chipsRef.current.scrollLeft = chipDrag.current.scroll - delta;
  };

  const onChipsPointerUp = () => {
    chipDrag.current.active = false;
  };

  const onChipsClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!chipDrag.current.moved) return;
    event.preventDefault();
    event.stopPropagation();
    chipDrag.current.moved = false;
  };

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
              <h1>Phương tiện</h1>
            </div>
            <div className="grab-page-header__actions">
              <button
                type="button"
                className={`vehicle-lookup-btn${lookup ? ' vehicle-lookup-btn--on' : ''}`}
                onClick={() => setLookupOpen(true)}
                aria-label="Tra cứu"
              >
                <Search size={18} strokeWidth={2.25} />
              </button>
              <button type="button" className="wf-create-btn" onClick={() => navigate('/settings/vehicles/new')}>
                <Plus size={16} strokeWidth={2.25} />
                Thêm
              </button>
            </div>
          </header>
          {!lookup && (
          <div className="manage-smart-filter" role="toolbar" aria-label="Lọc trạng thái phương tiện">
            <button
              type="button"
              className={`grab-page-header__filter manage-smart-filter__btn${filterActive ? ' grab-page-header__filter--active' : ''}`}
              onClick={() => {
                setFilterDraft(appliedFilter);
                setFilterOpen(true);
              }}
              aria-label="Bộ lọc phương tiện"
            >
              <FilterIcon />
              {filterActive && (
                <span className="grab-page-header__filter-badge" aria-hidden>
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div
              className="manage-smart-filter__chips"
              ref={chipsRef}
              onPointerDown={onChipsPointerDown}
              onPointerMove={onChipsPointerMove}
              onPointerUp={onChipsPointerUp}
              onPointerCancel={onChipsPointerUp}
              onClickCapture={onChipsClickCapture}
            >
              <DlsChip label="Tất cả" brand selected={statusView === 'all'} onClick={() => setStatusView('all')} />
              {VEHICLE_RUN_STATUSES.map((status) => (
                <DlsChip
                  key={status}
                  label={`${RUN_STATUS_LABEL[status]} ${statusCount(status)}`}
                  brand
                  selected={statusView === status}
                  onClick={() => setStatusView(status)}
                />
              ))}
            </div>
          </div>
          )}
        </div>

        {lookup && (
          <div className="grab-activity__filter-bar">
            <p className="grab-activity__filter-summary">
              {rows.length} xe trống trong {lookup.radiusKm} km quanh {lookup.centerLabel}, từ{' '}
              {formatLookupWhen(new Date(lookup.from).getTime())} đến{' '}
              {formatLookupWhen(new Date(lookup.to).getTime())}
            </p>
            <button type="button" className="grab-activity__filter-clear" onClick={() => setLookup(null)}>
              Xoá tra cứu
            </button>
          </div>
        )}

        {filterActive && !lookup && (
          <div className="grab-activity__filter-bar">
            <p className="grab-activity__filter-summary">
              Đang lọc theo {activeFilterCount} tiêu chí · {visible.length} xe
            </p>
            <button
              type="button"
              className="grab-activity__filter-clear"
              onClick={() => setAppliedFilter(EMPTY_VEHICLE_FILTER)}
            >
              Xoá lọc
            </button>
          </div>
        )}

        <div className="drv-vehicle-page__scroll">
          {rows.length === 0 ? (
            <p className="drv-vehicle-group__empty drv-vehicle-empty">
              {lookup
                ? 'Không có xe trống trong khoảng này.'
                : filterActive
                  ? 'Không tìm thấy phương tiện phù hợp.'
                  : 'Chưa có phương tiện.'}
            </p>
          ) : (
            <div className="drv-vehicle-sheet drv-vehicle-sheet--list">
              {rows.map(({ vehicle, distanceKm }) => (
                <VehicleRow
                  key={vehicle.id}
                  vehicle={vehicle}
                  distanceKm={distanceKm}
                  onOpen={() => navigate(`/settings/vehicles/${vehicle.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <VehicleFilterSheet
        open={filterOpen}
        stations={stations}
        drivers={drivers}
        value={filterDraft}
        onChange={setFilterDraft}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setAppliedFilter(filterDraft);
          setFilterOpen(false);
        }}
        onClear={() => {
          setFilterDraft(EMPTY_VEHICLE_FILTER);
          setAppliedFilter(EMPTY_VEHICLE_FILTER);
          setFilterOpen(false);
        }}
      />

      <VehicleLookupSheet
        open={lookupOpen}
        value={lookupDraft}
        onChange={setLookupDraft}
        onClose={() => setLookupOpen(false)}
        onApply={() => {
          setLookup(lookupDraft);
          setLookupOpen(false);
        }}
      />

      <DlsHomeIndicator />
    </MainShell>
  );
};

export default VehicleListPage;
