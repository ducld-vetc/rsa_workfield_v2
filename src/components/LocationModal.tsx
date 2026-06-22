import React from 'react';
import { DlsBrandButton, DlsNeutralButton } from '@dls/components';

interface LocationModalProps {
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ open, onAllow, onDeny }) => {
  if (!open) return null;

  return (
    <div className="dls-modal-overlay" role="dialog" aria-modal>
      <div className="dls-modal">
        <h3>Cho phép truy cập vị trí</h3>
        <p>
          Workfield cần quyền vị trí để gợi ý đơn cứu hộ gần bạn và theo dõi tiến trình.
        </p>
        <div className="dls-modal-actions">
          <DlsBrandButton onClick={onAllow}>Cho phép</DlsBrandButton>
          <DlsNeutralButton onClick={onDeny}>Không cho phép</DlsNeutralButton>
        </div>
      </div>
    </div>
  );
};
