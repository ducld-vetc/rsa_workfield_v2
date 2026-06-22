import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DlsBrandButton, DlsHomeIndicator, DlsTopNav } from '@dls/components';
import {
  isOtpExpired,
  maskPhone,
  OTP_RESEND_COOLDOWN_SEC,
  readForgotPasswordSession,
  resendOtpSession,
  verifyOtp,
} from '../utils/forgotPassword';

const OtpPage: React.FC = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = React.useState(['', '', '', '', '', '']);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(OTP_RESEND_COOLDOWN_SEC);
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);
  const session = readForgotPasswordSession();

  React.useEffect(() => {
    if (!session) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate, session]);

  React.useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendIn((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const handleChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (error) setError(null);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };

  const handleSubmit = () => {
    const code = digits.join('');
    const result = verifyOtp(code);

    if (result.status === 'ok') {
      navigate('/new-password');
      return;
    }

    if (result.status === 'locked') {
      navigate('/account-locked', {
        replace: true,
        state: { reason: 'otp' },
      });
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
    const next = resendOtpSession();
    if (!next) {
      navigate('/forgot-password', { replace: true });
      return;
    }
    setError(null);
    setDigits(['', '', '', '', '', '']);
    setResendIn(OTP_RESEND_COOLDOWN_SEC);
    refs.current[0]?.focus();
  };

  const complete = digits.every((d) => d.length === 1);
  const expiredOnLoad = session ? isOtpExpired(session) : false;

  if (!session) return null;

  return (
    <div className="dm-screen">
      <DlsTopNav title="Xác thực OTP" onBack={() => navigate('/forgot-password')} />
      <div className="dls-auth-body">
        <div className="dls-otp-block">
          <p className="dls-auth-hint">
            Nhập mã 6 số đã gửi tới {maskPhone(session.phone)}.
          </p>

          <div className="dls-otp-row">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className={`dls-otp-input${error ? ' dls-otp-input--error' : ''}`}
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? 'otp-error' : undefined}
              />
            ))}
          </div>

          {error && (
            <p id="otp-error" className="dls-otp-error" role="alert">
              {error}
            </p>
          )}

          {!error && expiredOnLoad && (
            <p className="dls-otp-error" role="alert">
              Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
            </p>
          )}
        </div>

        <DlsBrandButton onClick={handleSubmit} disabled={!complete}>
          Tiếp tục
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
  );
};

export default OtpPage;
