import React from 'react';
import {
  DlsChip,
  DlsHomeIndicator,
  DlsNeutralButton,
  DlsSheetHeader,
  DlsTextField,
} from '@dls/components';
import { MOCK_QUOTE_DRIVERS, MOCK_RESCUE_VEHICLES } from '../data/mockQuoteResources';
import {
  CUSTOMER_KIND_LABELS,
  CustomerKind,
  FilterState,
  ORDER_KIND_FILTERS,
  OrderStatus,
  QUOTE_FILTER_STATUSES,
  QUOTE_STATUS_LABELS,
  SERVICE_TYPE_OPTIONS,
  STATUS_LABELS,
} from '../types';

const RESCUE_STATUS_OPTIONS: OrderStatus[] = [
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
  mode?: 'rescue' | 'quote';
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  open,
  value,
  onChange,
  onClose,
  onApply,
  onClear,
  showServiceTypes = false,
  mode = 'rescue',
}) => {
  if (!open) return null;

  const statusOptions =
    mode === 'quote'
      ? QUOTE_FILTER_STATUSES.map((status) => ({
          id: status,
          label: QUOTE_STATUS_LABELS[status],
        }))
      : RESCUE_STATUS_OPTIONS.map((status) => ({
          id: status,
          label: STATUS_LABELS[status],
        }));

  const toggleService = (s: string) => {
    const set = new Set(value.serviceTypes);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    onChange({ ...value, serviceTypes: Array.from(set) });
  };

  const toggleStatus = (s: string) => {
    const set = new Set(value.statuses);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    onChange({ ...value, statuses: Array.from(set) });
  };

  const toggleList = (key: 'customerTypes' | 'orderKinds' | 'driverIds' | 'vehiclePlates', id: string) => {
    const set = new Set(value[key]);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    onChange({ ...value, [key]: Array.from(set) });
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
              label={mode === 'quote' ? 'Xe' : 'Biển số xe'}
              value={value.plate}
              onChange={(plate) => onChange({ ...value, plate })}
              placeholder={mode === 'quote' ? 'Biển số xe khách hoặc xe cứu hộ' : 'Nhập biển số xe'}
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
          {mode === 'rescue' && (
            <>
              <div className="dls-filter-section">
                <span className="dls-label">Loại khách hàng</span>
                <div className="dls-chip-wrap">
                  {(Object.keys(CUSTOMER_KIND_LABELS) as CustomerKind[]).map((kind) => (
                    <DlsChip
                      key={kind}
                      label={CUSTOMER_KIND_LABELS[kind]}
                      selected={value.customerTypes.includes(kind)}
                      onClick={() => toggleList('customerTypes', kind)}
                    />
                  ))}
                </div>
              </div>
              <div className="dls-filter-section">
                <span className="dls-label">Loại đơn</span>
                <div className="dls-chip-wrap">
                  {ORDER_KIND_FILTERS.map((kind) => (
                    <DlsChip
                      key={kind.id}
                      label={kind.label}
                      selected={value.orderKinds.includes(kind.id)}
                      onClick={() => toggleList('orderKinds', kind.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="dls-filter-section">
                <span className="dls-label">Tài xế</span>
                <div className="dls-chip-wrap">
                  {MOCK_QUOTE_DRIVERS.map((driver) => (
                    <DlsChip
                      key={driver.id}
                      label={driver.name}
                      selected={value.driverIds.includes(driver.id)}
                      onClick={() => toggleList('driverIds', driver.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="dls-filter-section">
                <span className="dls-label">Xe cứu hộ</span>
                <div className="dls-chip-wrap">
                  {MOCK_RESCUE_VEHICLES.map((vehicle) => (
                    <DlsChip
                      key={vehicle.id}
                      label={vehicle.plate}
                      selected={value.vehiclePlates.includes(vehicle.plate)}
                      onClick={() => toggleList('vehiclePlates', vehicle.plate)}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
          <div className="dls-filter-section">
            <span className="dls-label">Trạng thái</span>
            <div className="dls-chip-wrap">
              {statusOptions.map((status) => (
                <DlsChip
                  key={status.id}
                  label={status.label}
                  selected={value.statuses.includes(status.id)}
                  onClick={() => toggleStatus(status.id)}
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
