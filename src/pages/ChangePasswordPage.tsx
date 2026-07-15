import React from 'react';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/DetailRow';
import { DlsBrandButton, DlsHomeIndicator, DlsTextField, DlsTopNav } from '@dls/components';
import { getPasswordPolicyChecks, validatePasswordPolicy } from '../utils/forgotPassword';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [currentError, setCurrentError] = React.useState<string | null>(null);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);
  const [confirmError, setConfirmError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const policyChecks = getPasswordPolicyChecks(password);

  const handleSave = () => {
    setCurrentError(null);
    setPasswordError(null);
    setConfirmError(null);

    if (!current.trim()) {
      setCurrentError('Vui lòng nhập mật khẩu hiện tại.');
      return;
    }

    const policyResult = validatePasswordPolicy(password);
    if (!policyResult.valid) {
      setPasswordError(policyResult.message);
      return;
    }

    if (password === current) {
      setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    if (password !== confirm) {
      setConfirmError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="dm-screen grab-change-password">
      <DlsTopNav title="Đổi mật khẩu" onBack={() => navigate('/settings')} />
      <div className="dm-scroll-area">
        <div className="dls-auth-body grab-change-password__body">
          <div className="grab-change-password__intro">
            <h2>Bảo vệ tài khoản của bạn</h2>
            <p className="dls-auth-hint">
              Nhập mật khẩu hiện tại, rồi tạo mật khẩu mới đủ mạnh theo yêu cầu bên dưới.
            </p>
          </div>

          <DlsTextField
            label="Mật khẩu hiện tại"
            type="password"
            value={current}
            onChange={(value) => {
              setCurrent(value);
              if (currentError) setCurrentError(null);
            }}
            placeholder="Nhập mật khẩu đang dùng"
            required
            error={currentError ?? undefined}
          />

          <div className="grab-change-password__section">
            <p className="grab-change-password__section-label">Mật khẩu mới</p>
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
              placeholder="Nhập lại mật khẩu mới"
              required
              error={confirmError ?? undefined}
            />
          </div>

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
      </div>

      <div className="grab-onboard__footer grab-onboard__footer--legal">
        <DlsBrandButton
          onClick={handleSave}
          disabled={!current || !password || !confirm}
        >
          Lưu mật khẩu
        </DlsBrandButton>
      </div>

      <ConfirmDialog
        open={success}
        title="Thành công"
        message="Mật khẩu đã được thay đổi."
        confirmLabel="OK"
        cancelLabel=""
        onConfirm={() => navigate('/settings')}
        onCancel={() => navigate('/settings')}
      />
      <DlsHomeIndicator />
    </div>
  );
};

export default ChangePasswordPage;
