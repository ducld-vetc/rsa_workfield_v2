import React from 'react';
import {
  DlsChip,
  DlsHomeIndicator,
  DlsNeutralButton,
  DlsSheetHeader,
  DlsTextField,
} from '@dls/components';
import { FilterState, OrderStatus, SERVICE_TYPE_OPTIONS, STATUS_LABELS } from '../types';

const STATUS_OPTIONS: OrderStatus[] = [
  'cho-nhan',
  'dang-cuu-ho',
  'hoan-thanh',
  'tu-choi',
  'huy-don',
];

interface FilterSheetProps {
  open: boolean;
  value: FilterState;
  onChange: (v: FilterState) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  showServiceTypes?: boolean;
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  open,
  value,
  onChange,
  onClose,
  onApply,
  onClear,
  showServiceTypes = false,
}) => {
  if (!open) return null;

  const toggleService = (s: string) => {
    const set = new Set(value.serviceTypes);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    onChange({ ...value, serviceTypes: Array.from(set) });
  };

  const toggleStatus = (s: OrderStatus) => {
    const set = new Set(value.statuses);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    onChange({ ...value, statuses: Array.from(set) });
  };

  return (
    <div className="dls-sheet-overlay" role="dialog" aria-modal aria-label="Bộ lọc">
      <div className="dls-sheet">
        <DlsSheetHeader title="Bộ lọc" onClose={onClose} />
        <div className="dls-sheet-body">
          <div className="dls-filter-section">
            <div className="dls-date-row">
              <DlsTextField
                label="Từ ngày"
                value={value.fromDate}
                onChange={(fromDate) => onChange({ ...value, fromDate })}
                placeholder="dd/mm/yyyy"
              />
              <DlsTextField
                label="Đến ngày"
                value={value.toDate}
                onChange={(toDate) => onChange({ ...value, toDate })}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>
          <div className="dls-filter-section">
            <DlsTextField
              label="Biển số xe"
              value={value.plate}
              onChange={(plate) => onChange({ ...value, plate })}
              placeholder="Nhập biển số xe"
            />
          </div>
          {showServiceTypes && (
            <div className="dls-filter-section">
              <span className="dls-label">Loại dịch vụ</span>
              <div className="dls-chip-wrap">
                {SERVICE_TYPE_OPTIONS.map((s) => (
                  <DlsChip
                    key={s}
                    label={s}
                    selected={value.serviceTypes.includes(s)}
                    onClick={() => toggleService(s)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="dls-filter-section">
            <span className="dls-label">Trạng thái</span>
            <div className="dls-chip-wrap">
              {STATUS_OPTIONS.map((s) => (
                <DlsChip
                  key={s}
                  label={STATUS_LABELS[s]}
                  selected={value.statuses.includes(s)}
                  onClick={() => toggleStatus(s)}
                />
              ))}
            </div>
          </div>
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

export default FilterSheet;
