import React from 'react';
import { DlsBrandButton, DlsHomeIndicator, DlsLabel, DlsSheetHeader } from '@dls/components';
import {
  MOCK_QUOTE_DRIVERS,
  MOCK_RESCUE_VEHICLES,
} from '../data/mockQuoteResources';

const ASSIGN_CHANGE_REASONS = [
  'Tài xế hiện tại bận đơn khác',
  'Tài xế không sẵn sàng',
  'Phân công theo khu vực gần hơn',
  'Xe cứu hộ phù hợp hơn',
  'Lý do khác',
];

interface MissionAssignSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (driverId: string, vehicleId: string, reason: string) => void;
}

const MissionAssignSheet: React.FC<MissionAssignSheetProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [driverId, setDriverId] = React.useState(MOCK_QUOTE_DRIVERS[0]?.id ?? '');
  const [vehicleId, setVehicleId] = React.useState(MOCK_RESCUE_VEHICLES[0]?.id ?? '');
  const [selectedReason, setSelectedReason] = React.useState('');
  const [otherReason, setOtherReason] = React.useState('');

  React.useEffect(() => {
    if (!open) return;
    setDriverId(MOCK_QUOTE_DRIVERS[0]?.id ?? '');
    setVehicleId(MOCK_RESCUE_VEHICLES[0]?.id ?? '');
    setSelectedReason('');
    setOtherReason('');
  }, [open]);

  if (!open) return null;

  const changeReason =
    selectedReason === 'Lý do khác' ? otherReason.trim() : selectedReason;
  const canSubmit = Boolean(driverId && vehicleId && changeReason);

  return (
    <div
      className="dls-sheet-overlay"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <div className="dls-sheet" onClick={(e) => e.stopPropagation()}>
        <DlsSheetHeader title="Phân công tài xế khác" onClose={onClose} />
        <div className="dls-sheet-body dls-sheet-body--form">
          <p className="mission-assign-sheet__hint">
            Bạn không trực tiếp nhận đơn — chọn tài xế và xe cứu hộ để thực hiện nhiệm vụ.
          </p>
          <div className="dls-field">
            <DlsLabel required>Tài xế cứu hộ</DlsLabel>
            <select
              className="dls-select"
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
            >
              {MOCK_QUOTE_DRIVERS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} · {d.phone}
                </option>
              ))}
            </select>
          </div>
          <div className="dls-field">
            <DlsLabel required>Xe cứu hộ</DlsLabel>
            <select
              className="dls-select"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
            >
              {MOCK_RESCUE_VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate} · {v.type}
                </option>
              ))}
            </select>
          </div>
          <div className="dls-field">
            <DlsLabel required>Lý do thay đổi tài xế</DlsLabel>
            <div className="dls-reason-list">
              {ASSIGN_CHANGE_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  className={`dls-reason-item ${selectedReason === reason ? 'dls-reason-item--on' : ''}`}
                  onClick={() => setSelectedReason(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
            {selectedReason === 'Lý do khác' && (
              <textarea
                className="dls-textarea"
                placeholder="Nhập lý do thay đổi tài xế..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={3}
              />
            )}
          </div>
        </div>
        <div className="dls-sheet-footer dls-sheet-footer--single">
          <DlsBrandButton
            onClick={() => onConfirm(driverId, vehicleId, changeReason)}
            disabled={!canSubmit}
          >
            Xác nhận phân công
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  );
};

export default MissionAssignSheet;
