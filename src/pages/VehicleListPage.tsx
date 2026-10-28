import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DlsChip, DlsHomeIndicator, FilterIcon } from '@dls/components';
import MainShell from '../layouts/MainShell';
import VehicleFilterSheet, {
  countVehicleFilterCriteria,
  EMPTY_VEHICLE_FILTER,
  isVehicleFilterActive,
  VehicleFilterState,
} from '../components/VehicleFilterSheet';
import { useApp } from '../context/AppContext';
import {
  assignmentOf,
  DriverVehicle,
  pendingRepairCount,
  RUN_STATUS_LABEL,
  VehicleAssignment,
  vehicleAlerts,
  vehiclesForDriver,
} from '../data/driverVehicles';

type VehicleView = 'all' | VehicleAssignment;

const VIEW_OPTIONS: { id: VehicleView; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'primary', label: 'Xe chính' },
  { id: 'secondary', label: 'Xe phụ' },
];

const VehicleRow: React.FC<{ vehicle: DriverVehicle; onOpen: () => void }> = ({ vehicle, onOpen }) => {
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
  const plateQuery = query.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const plate = vehicle.plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const haystack = `${vehicle.plate} ${vehicle.regCode} ${vehicle.type} ${vehicle.brand} ${vehicle.modelLine} ${vehicle.station}`.toLowerCase();
  return (plateQuery && plate.includes(plateQuery)) || haystack.includes(query);
};

const VehicleListPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentDriverId } = useApp();
  const [view, setView] = React.useState<VehicleView>('all');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterDraft, setFilterDraft] = React.useState<VehicleFilterState>(EMPTY_VEHICLE_FILTER);
  const [appliedFilter, setAppliedFilter] = React.useState<VehicleFilterState>(EMPTY_VEHICLE_FILTER);

  const assigned = React.useMemo(() => vehiclesForDriver(currentDriverId), [currentDriverId]);
  const stations = React.useMemo(
    () => Array.from(new Set(assigned.map((item) => item.station).filter(Boolean))),
    [assigned],
  );
  const keyword = appliedFilter.query.trim().toLowerCase();

  const visible = assigned.filter((vehicle) => {
    const role = assignmentOf(vehicle, currentDriverId);
    if (view !== 'all' && role !== view) return false;
    if (appliedFilter.statuses.length > 0 && !appliedFilter.statuses.includes(vehicle.status)) return false;
    if (appliedFilter.stations.length > 0 && !appliedFilter.stations.includes(vehicle.station)) return false;
    return matchesQuery(vehicle, keyword);
  });

  const primaryCount = assigned.filter((item) => item.primaryDriverId === currentDriverId).length;
  const secondaryCount = assigned.filter((item) => item.secondaryDriverId === currentDriverId).length;
  const filterActive = isVehicleFilterActive(appliedFilter);
  const activeFilterCount = countVehicleFilterCriteria(appliedFilter);

  const viewLabel = (id: VehicleView) => {
    if (id === 'primary') return primaryCount > 0 ? `Xe chính ${primaryCount}` : 'Xe chính';
    if (id === 'secondary') return secondaryCount > 0 ? `Xe phụ ${secondaryCount}` : 'Xe phụ';
    return 'Tất cả';
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
              <button type="button" className="wf-create-btn" onClick={() => navigate('/settings/vehicles/new')}>
                <Plus size={16} strokeWidth={2.25} />
                Thêm
              </button>
            </div>
          </header>
          <div className="manage-smart-filter" role="toolbar" aria-label="Lọc vai trò xe">
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
            <div className="manage-smart-filter__chips">
              {VIEW_OPTIONS.map((option) => (
                <DlsChip
                  key={option.id}
                  label={viewLabel(option.id)}
                  brand
                  selected={view === option.id}
                  onClick={() => setView(option.id)}
                />
              ))}
            </div>
          </div>
        </div>

        {filterActive && (
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
          {visible.length === 0 ? (
            <p className="drv-vehicle-group__empty drv-vehicle-empty">
              {filterActive ? 'Không tìm thấy phương tiện phù hợp.' : 'Chưa có phương tiện.'}
            </p>
          ) : (
            <div className="drv-vehicle-sheet drv-vehicle-sheet--list">
              {visible.map((vehicle) => (
                <VehicleRow
                  key={vehicle.id}
                  vehicle={vehicle}
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

      <DlsHomeIndicator />
    </MainShell>
  );
};

export default VehicleListPage;
