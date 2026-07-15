import React from 'react';
import { Lock } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DlsBrandButton, DlsHomeIndicator, DlsTopNav } from '@dls/components';
import { clearForgotPasswordSession } from '../utils/forgotPassword';

const AccountLockedPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const reason = (location.state as { reason?: string } | null)?.reason;

  React.useEffect(() => {
    if (reason === 'otp') {
      clearForgotPasswordSession();
    }
  }, [reason]);

  const message =
    reason === 'otp'
      ? 'Bạn đã nhập sai mã OTP quá số lần cho phép. Vui lòng thử lại sau hoặc liên hệ quản trị viên.'
      : 'Tài khoản của bạn đã bị khoá do đăng nhập sai quá nhiều lần. Vui lòng liên hệ quản trị viên.';

  return (
    <div className="dm-screen">
      <DlsTopNav title="Tài khoản" />
      <div className="dls-auth-body dls-auth-body--center">
        <div className="dls-lock-icon" aria-hidden>
          <Lock size={32} strokeWidth={1.75} />
        </div>
        <h2 className="dls-auth-title">Tài khoản bị khoá</h2>
        <p className="dls-auth-hint">{message}</p>
        <DlsBrandButton onClick={() => navigate('/sign-in')}>Quay lại đăng nhập</DlsBrandButton>
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default AccountLockedPage;
