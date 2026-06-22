import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainShell from '../layouts/MainShell';
import { ConfirmDialog } from '../components/DetailRow';
import { useApp } from '../context/AppContext';
import {
  DlsHomeIndicator,
  DlsListRow,
  DlsToggle,
  LockIcon,
  LogOutIcon,
} from '@dls/components';
import { DRIVER_ROLE_LABELS } from '../types';

interface SettingsPageProps {
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { readyForRescue, setReadyForRescue, driverRole } = useApp();
  const [logoutOpen, setLogoutOpen] = React.useState(false);

  return (
    <MainShell>
      <div className="grab-settings">
        <header className="grab-page-header">
          <h1>Tài khoản</h1>
          <p>Cài đặt và hồ sơ tài xế</p>
        </header>

        <div className="grab-settings__profile">
          <span className="grab-profile__avatar grab-profile__avatar--lg">LT</span>
          <div>
            <p className="grab-settings__name">LiuTT</p>
            <p className="grab-settings__id">{DRIVER_ROLE_LABELS[driverRole]}</p>
          </div>
        </div>

        {(driverRole === 'quote-rescue' || driverRole === 'rescue-only') && (
          <section className="grab-settings__section">
            <div className="grab-settings-card">
              <DlsListRow
                label="Sẵn sàng đi cứu hộ"
                trailing={<DlsToggle on={readyForRescue} onChange={setReadyForRescue} />}
              />
            </div>
          </section>
        )}

        <section className="grab-settings__section">
          <div className="grab-settings-card">
            <DlsListRow
              icon={<LockIcon />}
              label="Đổi mật khẩu"
              onClick={() => navigate('/change-password')}
            />
            <DlsListRow
              icon={<LogOutIcon />}
              label="Đăng xuất"
              danger
              onClick={() => setLogoutOpen(true)}
            />
          </div>
        </section>

        <p className="grab-settings__version">Workfield v1.0.0</p>
      </div>

      <ConfirmDialog
        open={logoutOpen}
        title="Đăng xuất"
        message="Bạn có chắc muốn đăng xuất khỏi ứng dụng?"
        confirmLabel="Đăng xuất"
        cancelLabel="Huỷ"
        danger
        onConfirm={() => {
          setLogoutOpen(false);
          onLogout();
          navigate('/login');
        }}
        onCancel={() => setLogoutOpen(false)}
      />
      <DlsHomeIndicator />
    </MainShell>
  );
};

export default SettingsPage;
