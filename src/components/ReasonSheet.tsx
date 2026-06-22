import React from 'react';
import { DlsBrandButton, DlsHomeIndicator, DlsSheetHeader } from '@dls/components';

const REJECT_REASONS = [
  'Quá xa, không thể đến kịp',
  'Đang bận đơn khác',
  'Xe không phù hợp',
  'Lý do khác',
];

interface ReasonSheetProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const ReasonSheet: React.FC<ReasonSheetProps> = ({
  open,
  title = 'Lý do từ chối',
  onClose,
  onConfirm,
}) => {
  const [selected, setSelected] = React.useState('');
  const [other, setOther] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setSelected('');
      setOther('');
    }
  }, [open]);

  if (!open) return null;

  const reason = selected === 'Lý do khác' ? other.trim() : selected;
  const canSubmit = reason.length > 0;

  return (
    <div
      className="dls-sheet-overlay"
      role="dialog"
      aria-modal
      onClick={onClose}
    >
      <div className="dls-sheet" onClick={(e) => e.stopPropagation()}>
        <DlsSheetHeader title={title} onClose={onClose} />
        <div className="dls-sheet-body dls-sheet-body--form">
          <div className="dls-reason-list">
            {REJECT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                className={`dls-reason-item ${selected === r ? 'dls-reason-item--on' : ''}`}
                onClick={() => setSelected(r)}
              >
                {r}
              </button>
            ))}
          </div>
          {selected === 'Lý do khác' && (
            <textarea
              className="dls-textarea"
              placeholder="Nhập lý do..."
              value={other}
              onChange={(e) => setOther(e.target.value)}
              rows={3}
            />
          )}
        </div>
        <div className="dls-sheet-footer dls-sheet-footer--single">
          <DlsBrandButton onClick={() => onConfirm(reason)} disabled={!canSubmit}>
            Xác nhận
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  );
};

export default ReasonSheet;
