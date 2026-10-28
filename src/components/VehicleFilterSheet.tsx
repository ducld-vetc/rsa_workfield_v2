import React from 'react';
import { DlsChip, DlsHomeIndicator, DlsNeutralButton, DlsSearchField, DlsSheetHeader } from '@dls/components';
import { RUN_STATUS_LABEL, VehicleRunStatus } from '../data/driverVehicles';

export interface VehicleFilterState {
  query: string;
  statuses: VehicleRunStatus[];
  stations: string[];
}

export const EMPTY_VEHICLE_FILTER: VehicleFilterState = {
  query: '',
  statuses: [],
  stations: [],
};

export const isVehicleFilterActive = (filter: VehicleFilterState): boolean =>
  filter.query.trim().length > 0 || filter.statuses.length > 0 || filter.stations.length > 0;

export const countVehicleFilterCriteria = (filter: VehicleFilterState): number => {
  let count = 0;
  if (filter.query.trim()) count += 1;
  if (filter.statuses.length > 0) count += 1;
  if (filter.stations.length > 0) count += 1;
  return count;
};

const STATUS_OPTIONS: VehicleRunStatus[] = ['ready', 'repair'];

interface VehicleFilterSheetProps {
  open: boolean;
  stations: string[];
  value: VehicleFilterState;
  onChange: (value: VehicleFilterState) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const VehicleFilterSheet: React.FC<VehicleFilterSheetProps> = ({
  open,
  stations,
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

  const toggleStation = (station: string) => {
    const set = new Set(value.stations);
    if (set.has(station)) set.delete(station);
    else set.add(station);
    onChange({ ...value, stations: Array.from(set) });
  };

  return (
    <div className="dls-sheet-overlay" role="dialog" aria-modal aria-label="Bộ lọc phương tiện">
      <div className="dls-sheet">
        <DlsSheetHeader title="Lọc phương tiện" onClose={onClose} />
        <div className="dls-sheet-body">
          <DlsSearchField
            value={value.query}
            onChange={(query) => onChange({ ...value, query })}
            placeholder="Biển số, loại xe"
            ariaLabel="Tìm phương tiện"
          />
          <div className="dls-filter-section">
            <span className="dls-label">Trạng thái</span>
            <div className="dls-chip-wrap">
              {STATUS_OPTIONS.map((status) => (
                <DlsChip
                  key={status}
                  label={RUN_STATUS_LABEL[status]}
                  selected={value.statuses.includes(status)}
                  onClick={() => toggleStatus(status)}
                />
              ))}
            </div>
          </div>
          {stations.length > 0 && (
            <div className="dls-filter-section">
              <span className="dls-label">Trạm</span>
              <div className="dls-chip-wrap">
                {stations.map((station) => (
                  <DlsChip
                    key={station}
                    label={station}
                    selected={value.stations.includes(station)}
                    onClick={() => toggleStation(station)}
                  />
                ))}
              </div>
            </div>
          )}
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
