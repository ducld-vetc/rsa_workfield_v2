import React from 'react';
import { DlsBrandButton, DlsHomeIndicator, DlsSheetHeader } from '@dls/components';
import {
  DEMO_OTP_CODE,
  isStaffOtpExpired,
  maskPhone,
  OTP_RESEND_COOLDOWN_SEC,
  readStaffOtpSession,
  resendStaffOtpSession,
  StaffOtpPurpose,
  startStaffOtpSession,
  verifyStaffOtp,
} from '../utils/staffOtp';

interface StaffOtpSheetProps {
  open: boolean;
  phone: string;
  purpose: StaffOtpPurpose;
  title?: string;
  onClose: () => void;
  onVerified: () => void;
}

const StaffOtpSheet: React.FC<StaffOtpSheetProps> = ({
  open,
  phone,
  purpose,
  title = 'Xác thực OTP',
  onClose,
  onVerified,
}) => {
  const [digits, setDigits] = React.useState(['', '', '', '', '', '']);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(OTP_RESEND_COOLDOWN_SEC);
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (!open) return;
    startStaffOtpSession(phone, purpose);
    setDigits(['', '', '', '', '', '']);
    setError(null);
    setResendIn(OTP_RESEND_COOLDOWN_SEC);
    window.setTimeout(() => refs.current[0]?.focus(), 50);
  }, [open, phone, purpose]);

  React.useEffect(() => {
    if (!open || resendIn <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [open, resendIn]);

  if (!open) return null;

  const session = readStaffOtpSession();
  const expiredOnLoad = session ? isStaffOtpExpired(session) : false;
  const complete = digits.every((d) => d.length === 1);
  const hint =
    purpose === 'create-staff'
      ? `Nhập mã 6 số đã gửi tới ${maskPhone(phone)} để xác nhận tạo nhân sự.`
      : `Nhập mã 6 số đã gửi tới ${maskPhone(phone)} để xác nhận đổi số điện thoại.`;

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (error) setError(null);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleSubmit = () => {
    const result = verifyStaffOtp(digits.join(''));
    if (result.status === 'ok') {
      onVerified();
      return;
    }
    if (result.status === 'locked') {
      setError('Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.');
      setDigits(['', '', '', '', '', '']);
      refs.current[0]?.focus();
      return;
    }
    if (result.status === 'expired') {
      setError('Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.');
      setDigits(['', '', '', '', '', '']);
      refs.current[0]?.focus();
      return;
    }
    setError(`Mã OTP không đúng. Còn ${result.remaining} lần thử.`);
    setDigits(['', '', '', '', '', '']);
    refs.current[0]?.focus();
  };

  const handleResend = () => {
    if (resendIn > 0) return;
    resendStaffOtpSession();
    setError(null);
    setDigits(['', '', '', '', '', '']);
    setResendIn(OTP_RESEND_COOLDOWN_SEC);
    refs.current[0]?.focus();
  };

  return (
    <div
      className="dls-sheet-overlay"
      role="dialog"
      aria-modal
      aria-label={title}
      onClick={onClose}
    >
      <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
        <DlsSheetHeader title={title} onClose={onClose} />
        <div className="dls-sheet-body dls-sheet-body--form">
          <div className="dls-otp-block">
            <p className="dls-auth-hint">{hint}</p>
            <p className="grab-staff-otp-demo">Demo OTP: {DEMO_OTP_CODE}</p>

            <div className="dls-otp-row">
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    refs.current[index] = el;
                  }}
                  className={`dls-otp-input${error ? ' dls-otp-input--error' : ''}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  aria-invalid={error ? true : undefined}
                />
              ))}
            </div>

            {error && (
              <p className="dls-otp-error" role="alert">
                {error}
              </p>
            )}
            {!error && expiredOnLoad && (
              <p className="dls-otp-error" role="alert">
                Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
              </p>
            )}
          </div>
        </div>
        <div className="dls-sheet-footer dls-sheet-footer--single">
          <DlsBrandButton onClick={handleSubmit} disabled={!complete}>
            Xác nhận OTP
          </DlsBrandButton>
          <button
            type="button"
            className="dls-link-btn dls-otp-resend"
            onClick={handleResend}
            disabled={resendIn > 0}
          >
            {resendIn > 0 ? `Gửi lại mã (${resendIn}s)` : 'Gửi lại mã'}
          </button>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  );
};

export default StaffOtpSheet;
