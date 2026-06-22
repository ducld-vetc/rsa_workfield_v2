import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DlsBrandButton,
  DlsCheckbox,
  DlsHomeIndicator,
  DlsTextField,
} from '@dls/components';

const VetcLogo = () => (
  <svg viewBox="0 0 120 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="grab-login-logo">
    <text x="0" y="38" fill="#25a55e" fontFamily="'SF Pro Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" fontWeight="800" fontSize="40" fontStyle="italic">
      VETC
    </text>
  </svg>
);

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = React.useState('LiuTT');
  const [password, setPassword] = React.useState('password');
  const [remember, setRemember] = React.useState(true);

  const handleLogin = () => {
    if (username === 'locked') {
      navigate('/account-locked');
      return;
    }
    onLogin();
  };

  return (
    <div className="dm-screen grab-login">
      <div className="grab-login__top">
        <VetcLogo />
        <h1>Workfield Driver</h1>
        <p>Đăng nhập để bắt đầu nhận đơn cứu hộ</p>
      </div>

      <div className="grab-login__form">
        <DlsTextField
          label="Tên đăng nhập"
          value={username}
          onChange={setUsername}
          placeholder="Nhập tên đăng nhập"
          required
        />
        <DlsTextField
          label="Mật khẩu"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Nhập mật khẩu"
          required
        />
        <div className="grab-login__row">
          <div className="grab-login__remember">
            <DlsCheckbox checked={remember} onChange={setRemember} label="Lưu mật khẩu" />
          </div>
          <button
            type="button"
            className="dls-link-btn grab-login__forgot"
            onClick={() => navigate('/forgot-password')}
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>

      <div className="grab-login__footer">
        <DlsBrandButton onClick={handleLogin} disabled={!username || !password}>
          Đăng nhập
        </DlsBrandButton>
        <p className="grab-login__version">v1.0.0</p>
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default LoginPage;
