import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DlsBrandButton, DlsHomeIndicator, DlsTextField, DlsTopNav } from '@dls/components';
import {
  isRegisteredPhone,
  isValidPhoneFormat,
  startOtpSession,
} from '../utils/forgotPassword';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = () => {
    setError(null);

    if (!isValidPhoneFormat(phone)) {
      setError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng 0xxxxxxxxx.');
      return;
    }

    if (!isRegisteredPhone(phone)) {
      setError('Số điện thoại chưa được đăng ký trên hệ thống. Vui lòng kiểm tra lại.');
      return;
    }

    startOtpSession(phone);
    navigate('/otp');
  };

  return (
    <div className="dm-screen">
      <DlsTopNav title="Quên mật khẩu" onBack={() => navigate('/sign-in')} />
      <div className="dls-auth-body">
        <p className="dls-auth-hint">Nhập số điện thoại đăng ký để nhận mã OTP.</p>
        <DlsTextField
          label="Số điện thoại"
          value={phone}
          onChange={(value) => {
            setPhone(value);
            if (error) setError(null);
          }}
          placeholder="Nhập SĐT"
          required
          error={error ?? undefined}
        />
        <DlsBrandButton onClick={handleSubmit} disabled={phone.trim().length < 9}>
          Gửi mã OTP
        </DlsBrandButton>
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default ForgotPasswordPage;
