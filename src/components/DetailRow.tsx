import React from 'react';

export const DetailRow: React.FC<{
  label: string;
  value: string;
  multiline?: boolean;
  last?: boolean;
}> = ({ label, value, multiline, last }) => (
  <div className={`dls-detail-row ${last ? 'dls-detail-row--last' : ''} ${multiline ? 'dls-detail-row--multi' : ''}`}>
    <span className="dls-detail-row__label">{label}</span>
    <span className="dls-detail-row__value">{value}</span>
  </div>
);

export const FixedButtonBar: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="dls-fixed-bar">
    <div className="dls-fixed-bar__actions">{children}</div>
  </div>
);

export const ProgressBanner: React.FC<{
  text: string;
  variant?: 'urgent' | 'info';
}> = ({ text, variant = 'urgent' }) => (
  <div className={`dls-progress-banner dls-progress-banner--${variant}`}>
    <span className="dls-progress-banner__icon">🚨</span>
    <span>{text}</span>
  </div>
);

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}> = ({ open, title, message, confirmLabel, cancelLabel = 'Huỷ', onConfirm, onCancel, danger }) => {
  if (!open) return null;
  return (
    <div className="dls-dialog-overlay" role="dialog" aria-modal>
      <div className="dls-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className={`dls-dialog-actions ${!cancelLabel ? 'dls-dialog-actions--single' : ''}`}>
          {cancelLabel && (
            <button type="button" className="dls-btn-neutral dls-btn-full" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`dls-btn-brand dls-btn-full ${danger ? 'dls-btn-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
