import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DlsBrandButton,
  DlsCheckbox,
  DlsHomeIndicator,
  DlsTextField,
  DlsTopNav,
} from '@dls/components';

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
    <div className="dm-screen grab-signin">
      <DlsTopNav title="Đăng nhập" onBack={() => navigate('/login')} />
      <div className="dls-auth-body grab-signin__body">
        <p className="dls-auth-hint">
          Đăng nhập tài khoản tài xế / trạm đối tác VETC Cứu hộ.
        </p>
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
        <div className="grab-signin__row">
          <DlsCheckbox checked={remember} onChange={setRemember} label="Lưu mật khẩu" />
          <button
            type="button"
            className="dls-link-btn"
            onClick={() => navigate('/forgot-password')}
          >
            Quên mật khẩu?
          </button>
        </div>
        <DlsBrandButton onClick={handleLogin} disabled={!username || !password}>
          Đăng nhập
        </DlsBrandButton>
        <button
          type="button"
          className="dls-link-btn grab-signin__register"
          onClick={() => navigate('/register-quick-service')}
        >
          Chưa có tài khoản? Đăng ký ngay
        </button>
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default LoginPage;
