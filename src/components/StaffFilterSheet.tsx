import React from 'react';
import {
  DlsChip,
  DlsHomeIndicator,
  DlsNeutralButton,
  DlsSheetHeader,
} from '@dls/components';
import { STAFF_ROLE_OPTIONS, StaffStatus } from '../utils/staff';

export interface StaffFilterState {
  roles: string[];
  statuses: StaffStatus[];
}

export const EMPTY_STAFF_FILTER: StaffFilterState = {
  roles: [],
  statuses: [],
};

export const isStaffFilterActive = (filter: StaffFilterState): boolean =>
  filter.roles.length > 0 || filter.statuses.length > 0;

export const countStaffFilterCriteria = (filter: StaffFilterState): number => {
  let count = 0;
  if (filter.roles.length > 0) count += 1;
  if (filter.statuses.length > 0) count += 1;
  return count;
};

const STATUS_OPTIONS: Array<{ value: StaffStatus; label: string }> = [
  { value: 'active', label: 'Đang hoạt động' },
  { value: 'paused', label: 'Tạm dừng' },
];

interface StaffFilterSheetProps {
  open: boolean;
  value: StaffFilterState;
  onChange: (value: StaffFilterState) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const StaffFilterSheet: React.FC<StaffFilterSheetProps> = ({
  open,
  value,
  onChange,
  onClose,
  onApply,
  onClear,
}) => {
  if (!open) return null;

  const toggleRole = (role: string) => {
    const set = new Set(value.roles);
    if (set.has(role)) set.delete(role);
    else set.add(role);
    onChange({ ...value, roles: Array.from(set) });
  };

  const toggleStatus = (status: StaffStatus) => {
    const set = new Set(value.statuses);
    if (set.has(status)) set.delete(status);
    else set.add(status);
    onChange({ ...value, statuses: Array.from(set) });
  };

  return (
    <div className="dls-sheet-overlay" role="dialog" aria-modal aria-label="Bộ lọc nhân sự">
      <div className="dls-sheet">
        <DlsSheetHeader title="Lọc nhân sự" onClose={onClose} />
        <div className="dls-sheet-body">
          <div className="dls-filter-section">
            <span className="dls-label">Vai trò</span>
            <div className="dls-chip-wrap">
              {STAFF_ROLE_OPTIONS.map((role) => (
                <DlsChip
                  key={role}
                  label={role}
                  selected={value.roles.includes(role)}
                  onClick={() => toggleRole(role)}
                />
              ))}
            </div>
          </div>
          <div className="dls-filter-section">
            <span className="dls-label">Trạng thái</span>
            <div className="dls-chip-wrap">
              {STATUS_OPTIONS.map((option) => (
                <DlsChip
                  key={option.value}
                  label={option.label}
                  selected={value.statuses.includes(option.value)}
                  onClick={() => toggleStatus(option.value)}
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

export default StaffFilterSheet;
