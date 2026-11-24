import React from 'react';
import { DlsChip, DlsHomeIndicator, DlsNeutralButton, DlsSearchField, DlsSelectField, DlsSheetHeader } from '@dls/components';
import { RUN_STATUS_LABEL, VEHICLE_RUN_STATUSES, VEHICLE_TYPE_OPTIONS, VehicleRunStatus } from '../data/driverVehicles';

const ALL = 'Tất cả';

export interface VehicleFilterState {
  query: string;
  statuses: VehicleRunStatus[];
  station: string;
  driverId: string;
  type: string;
}

export const EMPTY_VEHICLE_FILTER: VehicleFilterState = {
  query: '',
  statuses: [],
  station: '',
  driverId: '',
  type: '',
};

export const isVehicleFilterActive = (filter: VehicleFilterState): boolean =>
  filter.query.trim().length > 0 ||
  filter.statuses.length > 0 ||
  filter.station.length > 0 ||
  filter.driverId.length > 0 ||
  filter.type.length > 0;

export const countVehicleFilterCriteria = (filter: VehicleFilterState): number => {
  let count = 0;
  if (filter.query.trim()) count += 1;
  if (filter.statuses.length > 0) count += 1;
  if (filter.station) count += 1;
  if (filter.driverId) count += 1;
  if (filter.type) count += 1;
  return count;
};

export interface VehicleDriverOption {
  id: string;
  name: string;
}

interface VehicleFilterSheetProps {
  open: boolean;
  stations: string[];
  drivers: VehicleDriverOption[];
  value: VehicleFilterState;
  onChange: (value: VehicleFilterState) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const VehicleFilterSheet: React.FC<VehicleFilterSheetProps> = ({
  open,
  stations,
  drivers,
  value,
  onChange,
  onClose,
  onApply,
  onClear,
}) => {
  if (!open) return null;

  const toggleStatus = (status: VehicleRunStatus) => {
    const set = new Set(value.statuses);
    if (set.has(status)) set.delete(status);
    else set.add(status);
    onChange({ ...value, statuses: Array.from(set) });
  };

  const driverName = drivers.find((item) => item.id === value.driverId)?.name ?? '';

  return (
    <div className="dls-sheet-overlay" role="dialog" aria-modal aria-label="Bộ lọc phương tiện">
      <div className="dls-sheet">
        <DlsSheetHeader title="Lọc phương tiện" onClose={onClose} />
        <div className="dls-sheet-body vehicle-filter-body">
          <DlsSearchField
            value={value.query}
            onChange={(query) => onChange({ ...value, query })}
            placeholder="Biển số xe, Số khung"
            ariaLabel="Tìm phương tiện"
          />
          <div className="dls-filter-section">
            <span className="dls-label">Trạng thái</span>
            <div className="dls-chip-wrap">
              {VEHICLE_RUN_STATUSES.map((status) => (
                <DlsChip
                  key={status}
                  label={RUN_STATUS_LABEL[status]}
                  selected={value.statuses.includes(status)}
                  onClick={() => toggleStatus(status)}
                />
              ))}
            </div>
          </div>
          <DlsSelectField
            label="Trạm"
            value={value.station}
            options={[ALL, ...stations]}
            onChange={(station) => onChange({ ...value, station: station === ALL ? '' : station })}
            placeholder="Tất cả"
            sheetTitle="Chọn trạm"
            searchable
            searchPlaceholder="Tìm trạm"
          />
          <DlsSelectField
            label="Tài xế"
            value={driverName}
            options={[ALL, ...drivers.map((item) => item.name)]}
            onChange={(name) => {
              const driver = drivers.find((item) => item.name === name);
              onChange({ ...value, driverId: !driver || name === ALL ? '' : driver.id });
            }}
            placeholder="Tất cả"
            sheetTitle="Chọn tài xế"
            searchable
            searchPlaceholder="Tìm tài xế"
          />
          <DlsSelectField
            label="Loại xe"
            value={value.type}
            options={[ALL, ...VEHICLE_TYPE_OPTIONS]}
            onChange={(type) => onChange({ ...value, type: type === ALL ? '' : type })}
            placeholder="Tất cả"
            sheetTitle="Chọn loại xe"
            searchable
            searchPlaceholder="Tìm loại xe"
          />
        </div>
        <div className="dls-sheet-footer">
          <DlsNeutralButton onClick={onClear}>Xoá bộ lọc</DlsNeutralButton>
          <button type="button" className="dls-btn-brand dls-btn-full dls-btn-apply" onClick={onApply}>
            Áp dụng
          </button>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  );
};

export default VehicleFilterSheet;
