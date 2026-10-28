import React from 'react';
import { BookOpen, Truck, Users } from 'lucide-react';
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
          <section className="grab-settings__section" aria-label="Chỉ số cá nhân">
            <p className="grab-settings__stats-title">Chỉ số tháng này</p>
            <div className="grab-settings__stats">
              <article className="grab-settings-stat">
                <p>Số chuyến cứu hộ</p>
                <strong>48</strong>
              </article>
              <article className="grab-settings-stat">
                <p>Doanh thu cứu hộ</p>
                <strong>86,4 triệu</strong>
              </article>
              <article className="grab-settings-stat">
                <p>Số sao đánh giá</p>
                <strong>4,8</strong>
              </article>
              <article className="grab-settings-stat">
                <p>SLA trung bình</p>
                <strong>16 phút</strong>
              </article>
              <article className="grab-settings-stat">
                <p>Tỷ lệ nhận đơn</p>
                <strong>92%</strong>
              </article>
              <article className="grab-settings-stat">
                <p>Km đã chạy</p>
                <strong>612 km</strong>
              </article>
            </div>
          </section>
        )}

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
              icon={<BookOpen size={20} strokeWidth={1.75} />}
              label="Hướng dẫn sử dụng"
              onClick={() => navigate('/onboarding?replay=1')}
            />
            <DlsListRow
              icon={<LockIcon />}
              label="Đổi mật khẩu"
              onClick={() => navigate('/change-password')}
            />
            <DlsListRow
              icon={<Truck size={20} strokeWidth={1.75} />}
              label="Phương tiện"
              onClick={() => navigate('/settings/vehicles')}
            />
            <DlsListRow
              icon={<Users size={20} strokeWidth={1.75} />}
              label="Quản lý nhân sự"
              onClick={() => navigate('/settings/staff')}
            />
            <DlsListRow
              icon={<LogOutIcon />}
              label="Đăng xuất"
              danger
              onClick={() => setLogoutOpen(true)}
            />
          </div>
        </section>

        <p className="grab-settings__version">VETC Cứu hộ v1.0.0</p>
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
