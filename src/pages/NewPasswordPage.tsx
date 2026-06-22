import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/DetailRow';
import { DlsBrandButton, DlsHomeIndicator, DlsTextField, DlsTopNav } from '@dls/components';
import {
  clearForgotPasswordSession,
  getPasswordPolicyChecks,
  readForgotPasswordSession,
  validatePasswordPolicy,
} from '../utils/forgotPassword';

const NewPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const policyChecks = getPasswordPolicyChecks(password);

  React.useEffect(() => {
    if (!readForgotPasswordSession()) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  const handleSave = () => {
    setPasswordError(null);
    setConfirmError(null);

    const policyResult = validatePasswordPolicy(password);
    if (!policyResult.valid) {
      setPasswordError(policyResult.message);
      return;
    }

    if (password !== confirm) {
      setConfirmError('Mật khẩu xác nhận không khớp.');
      return;
    }

    clearForgotPasswordSession();
    setSuccess(true);
  };

  return (
    <div className="dm-screen">
      <DlsTopNav title="Đặt mật khẩu mới" onBack={() => navigate('/otp')} />
      <div className="dls-auth-body">
        <DlsTextField
          label="Mật khẩu mới"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (passwordError) setPasswordError(null);
          }}
          placeholder="Nhập mật khẩu mới"
          required
          error={passwordError ?? undefined}
        />
        <DlsTextField
          label="Xác nhận mật khẩu"
          type="password"
          value={confirm}
          onChange={(value) => {
            setConfirm(value);
            if (confirmError) setConfirmError(null);
          }}
          placeholder="Nhập lại mật khẩu"
          required
          error={confirmError ?? undefined}
        />
        <DlsBrandButton
          onClick={handleSave}
          disabled={!password || !confirm}
        >
          Lưu mật khẩu
        </DlsBrandButton>

        <div className="dls-auth-policy">
          <strong>Yêu cầu bảo mật</strong>
          <ul className="dls-auth-policy__list">
            {policyChecks.map((check) => (
              <li
                key={check.id}
                className={`dls-auth-policy__item${check.met ? ' dls-auth-policy__item--met' : ''}`}
              >
                <span className="dls-auth-policy__mark" aria-hidden>
                  {check.met && <Check size={12} strokeWidth={3} />}
                </span>
                <span>{check.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ConfirmDialog
        open={success}
        title="Thành công"
        message="Mật khẩu đã được cập nhật. Vui lòng đăng nhập lại."
        confirmLabel="Đăng nhập"
        cancelLabel=""
        onConfirm={() => navigate('/login')}
        onCancel={() => navigate('/login')}
      />
      <DlsHomeIndicator />
    </div>
  );
};

export default NewPasswordPage;
