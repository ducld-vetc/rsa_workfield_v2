import React from 'react';
import { DlsChip, DlsHomeIndicator, DlsSheetHeader } from '@dls/components';
import StationMapPicker from './StationMapPicker';
import { GeoPoint } from '../types';
import {
  LOOKUP_CENTER_PRESET,
  RADIUS_OPTIONS,
  defaultLookupRange,
} from '../utils/vehicleLookup';

export interface VehicleLookupDraft {
  from: string;
  to: string;
  radiusKm: number;
  center: GeoPoint | null;
  centerLabel: string;
}

export function emptyLookupDraft(): VehicleLookupDraft {
  const range = defaultLookupRange();
  return {
    from: range.from,
    to: range.to,
    radiusKm: 10,
    center: LOOKUP_CENTER_PRESET.point,
    centerLabel: LOOKUP_CENTER_PRESET.label,
  };
}

interface VehicleLookupSheetProps {
  open: boolean;
  value: VehicleLookupDraft;
  onChange: (value: VehicleLookupDraft) => void;
  onClose: () => void;
  onApply: () => void;
}

const VehicleLookupSheet: React.FC<VehicleLookupSheetProps> = ({
  open,
  value,
  onChange,
  onClose,
  onApply,
}) => {
  if (!open) return null;
  const fromMs = value.from ? new Date(value.from).getTime() : NaN;
  const toMs = value.to ? new Date(value.to).getTime() : NaN;
  const rangeOk = Number.isFinite(fromMs) && Number.isFinite(toMs) && toMs > fromMs;
  const canApply = rangeOk && value.center != null && value.radiusKm > 0;

  return (
    <div className="dls-sheet-overlay" role="dialog" aria-modal aria-label="Tra cứu xe trống">
      <div className="dls-sheet">
        <DlsSheetHeader title="Tra cứu xe trống" onClose={onClose} />
        <div className="dls-sheet-body">
          <div className="vehicle-lookup-times">
            <label className="vehicle-lookup-field">
              <span className="dls-label">Từ</span>
              <input
                type="datetime-local"
                value={value.from}
                onChange={(event) => onChange({ ...value, from: event.target.value })}
              />
            </label>
            <label className="vehicle-lookup-field">
              <span className="dls-label">Đến</span>
              <input
                type="datetime-local"
                value={value.to}
                onChange={(event) => onChange({ ...value, to: event.target.value })}
              />
            </label>
          </div>
          {!rangeOk && <p className="vehicle-lookup-error">Thời điểm đến phải sau thời điểm từ.</p>}
          <div className="dls-filter-section">
            <span className="dls-label">Bán kính</span>
            <div className="dls-chip-wrap">
              {RADIUS_OPTIONS.map((km) => (
                <DlsChip
                  key={km}
                  label={`${km} km`}
                  selected={value.radiusKm === km}
                  onClick={() => onChange({ ...value, radiusKm: km })}
                />
              ))}
            </div>
          </div>
          <div className="dls-filter-section">
            <span className="dls-label">Tâm tra cứu</span>
            <StationMapPicker
              value={value.center}
              searchable
              hint="Chọn gợi ý hoặc chạm bản đồ để đặt tâm."
              onChange={(point) =>
                onChange({
                  ...value,
                  center: point,
                  centerLabel: `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`,
                })
              }
            />
          </div>
        </div>
        <div className="dls-sheet-footer">
          <button
            type="button"
            className="dls-btn-brand dls-btn-full dls-btn-apply vehicle-lookup-apply"
            disabled={!canApply}
            onClick={onApply}
          >
            Xem kết quả
          </button>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  );
};

export default VehicleLookupSheet;
