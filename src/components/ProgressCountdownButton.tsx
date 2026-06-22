import React from 'react';
import { ConfirmDialog } from './DetailRow';

export interface ProgressCountdownExpireDialog {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
}

interface ProgressCountdownButtonProps {
  label: string;
  initialSeconds?: number;
  disabled?: boolean;
  onClick: () => void;
  onExpire?: () => void;
  expireDialog?: ProgressCountdownExpireDialog;
  className?: string;
}

const formatTime = (total: number) => {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const ProgressCountdownButton: React.FC<ProgressCountdownButtonProps> = ({
  label,
  initialSeconds = 0,
  disabled = false,
  onClick,
  onExpire,
  expireDialog,
  className = '',
}) => {
  const hasTimer = initialSeconds > 0;
  const [remaining, setRemaining] = React.useState(initialSeconds);
  const [expiredDialog, setExpiredDialog] = React.useState(false);
  const expiredCalled = React.useRef(false);

  React.useEffect(() => {
    setRemaining(initialSeconds);
    expiredCalled.current = false;
    setExpiredDialog(false);
  }, [initialSeconds]);

  React.useEffect(() => {
    if (!hasTimer || remaining <= 0) {
      if (hasTimer && remaining <= 0 && !expiredCalled.current) {
        expiredCalled.current = true;
        setExpiredDialog(true);
        onExpire?.();
      }
      return undefined;
    }
    const t = window.setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => window.clearInterval(t);
  }, [remaining, hasTimer, onExpire]);

  const progress = hasTimer && initialSeconds > 0
    ? (remaining / initialSeconds) * 100
    : 100;

  const timedOut = hasTimer && remaining <= 0;

  return (
    <>
      <button
        type="button"
        className={`quote-submit-btn ${timedOut ? 'quote-submit-btn--expired' : ''} ${className}`.trim()}
        disabled={disabled || timedOut}
        onClick={onClick}
      >
        {hasTimer && (
          <span
            className="quote-submit-btn__fill"
            style={{ width: `${Math.max(0, progress)}%` }}
            aria-hidden
          />
        )}
        <span className="quote-submit-btn__text">
          {label}
          {hasTimer && !timedOut && (
            <span className="quote-submit-btn__time"> · {formatTime(remaining)}</span>
          )}
        </span>
      </button>

      {expireDialog && (
        <ConfirmDialog
          open={expiredDialog}
          title={expireDialog.title}
          message={expireDialog.message}
          confirmLabel={expireDialog.confirmLabel ?? 'Đã hiểu'}
          cancelLabel={expireDialog.cancelLabel ?? ''}
          onConfirm={() => {
            setExpiredDialog(false);
            expireDialog.onConfirm?.();
          }}
          onCancel={() => setExpiredDialog(false)}
        />
      )}
    </>
  );
};

export default ProgressCountdownButton;
