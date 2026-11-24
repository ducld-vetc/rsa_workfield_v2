import React from 'react';
import { DlsChip, DlsHomeIndicator, DlsNeutralButton, DlsSearchField, DlsSelectField, DlsSheetHeader } from '@dls/components';
import { DRIVER_PAYER_LABEL, DRIVER_PURPOSE_LABEL, DriverAdvancePayer, DriverAdvancePurpose } from '../data/driverAdvances';

const ALL = 'Tất cả';

export interface AdvanceFilterState {
  orderId: string;
  purpose: '' | DriverAdvancePurpose;
  reimburseBy: '' | DriverAdvancePayer;
  requester: string;
  from: string;
  to: string;
}

export const EMPTY_ADVANCE_FILTER: AdvanceFilterState = {
  orderId: '',
  purpose: '',
  reimburseBy: '',
  requester: '',
  from: '',
  to: '',
};

export const isAdvanceFilterActive = (filter: AdvanceFilterState) =>
  filter.orderId.trim().length > 0 ||
  filter.purpose.length > 0 ||
  filter.reimburseBy.length > 0 ||
  filter.requester.length > 0 ||
  filter.from.length > 0 ||
  filter.to.length > 0;

export const countAdvanceFilterCriteria = (filter: AdvanceFilterState) => {
  let count = 0;
  if (filter.orderId.trim()) count += 1;
  if (filter.purpose) count += 1;
  if (filter.reimburseBy) count += 1;
  if (filter.requester) count += 1;
  if (filter.from || filter.to) count += 1;
  return count;
};

interface AdvanceFilterSheetProps {
  open: boolean;
  requesters: string[];
  value: AdvanceFilterState;
  onChange: (value: AdvanceFilterState) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const AdvanceFilterSheet: React.FC<AdvanceFilterSheetProps> = ({
  open,
  requesters,
  value,
  onChange,
  onClose,
  onApply,
  onClear,
}) => {
  if (!open) return null;
  const purposes = Object.keys(DRIVER_PURPOSE_LABEL) as DriverAdvancePurpose[];
  const payers = Object.keys(DRIVER_PAYER_LABEL) as DriverAdvancePayer[];

  return (
    <div className="dls-sheet-overlay" role="dialog" aria-modal aria-label="Lọc yêu cầu ứng tiền">
      <div className="dls-sheet">
        <DlsSheetHeader title="Lọc yêu cầu" onClose={onClose} />
        <div className="dls-sheet-body vehicle-filter-body">
          <div className="dls-filter-section">
            <span className="dls-label">Thời gian tạo</span>
            <div className="vehicle-lookup-times">
              <label className="vehicle-lookup-field">
                <span className="dls-label">Từ</span>
                <input
                  type="date"
                  value={value.from}
                  onChange={(event) => onChange({ ...value, from: event.target.value })}
                />
              </label>
              <label className="vehicle-lookup-field">
                <span className="dls-label">Đến</span>
                <input
                  type="date"
                  value={value.to}
                  onChange={(event) => onChange({ ...value, to: event.target.value })}
                />
              </label>
            </div>
          </div>
          <DlsSearchField
            value={value.orderId}
            onChange={(orderId) => onChange({ ...value, orderId })}
            placeholder="Mã đơn hàng"
            ariaLabel="Tìm theo mã đơn"
          />
          <div className="dls-filter-section">
            <span className="dls-label">Loại yêu cầu</span>
            <div className="dls-chip-wrap">
              <DlsChip
                label={ALL}
                selected={!value.purpose}
                onClick={() => onChange({ ...value, purpose: '' })}
              />
              {purposes.map((purpose) => (
                <DlsChip
                  key={purpose}
                  label={DRIVER_PURPOSE_LABEL[purpose]}
                  selected={value.purpose === purpose}
                  onClick={() => onChange({ ...value, purpose })}
                />
              ))}
            </div>
          </div>
          <div className="dls-filter-section">
            <span className="dls-label">Người hoàn ứng</span>
            <div className="dls-chip-wrap">
              <DlsChip
                label={ALL}
                selected={!value.reimburseBy}
                onClick={() => onChange({ ...value, reimburseBy: '' })}
              />
              {payers.map((payer) => (
                <DlsChip
                  key={payer}
                  label={DRIVER_PAYER_LABEL[payer]}
                  selected={value.reimburseBy === payer}
                  onClick={() => onChange({ ...value, reimburseBy: payer })}
                />
              ))}
            </div>
          </div>
          <DlsSelectField
            label="Người yêu cầu"
            value={value.requester}
            options={[ALL, ...requesters]}
            onChange={(requester) => onChange({ ...value, requester: requester === ALL ? '' : requester })}
            placeholder="Tất cả"
            sheetTitle="Chọn người yêu cầu"
            searchable
            searchPlaceholder="Tìm người yêu cầu"
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

export default AdvanceFilterSheet;
