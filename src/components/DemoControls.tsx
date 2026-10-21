import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_QUOTE_DRIVERS } from '../data/mockQuoteResources';
import { DRIVER_ROLE_LABELS, DriverRole } from '../types';
import { resetOnboardingDone } from '../utils/onboarding';

const ROLES: DriverRole[] = ['quote-rescue', 'quote-only', 'rescue-only'];

const DemoControls: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const {
    driverRole,
    setDriverRole,
    currentDriverId,
    setCurrentDriverId,
    demoHasOrders,
    setDemoHasOrders,
    locationGateOn,
    setLocationGateOn,
    poorConnection,
    setPoorConnection,
  } = useApp();

  return (
    <aside className="dm-demo-panel" aria-label="Điều khiển demo">
      <h3 className="dm-demo-panel__title">Demo</h3>

      <div className="dm-demo-panel__block">
        <span className="dm-demo-panel__label">Vai trò tài xế</span>
        <div className="dm-demo-panel__roles">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              className={`dm-demo-panel__role ${driverRole === role ? 'dm-demo-panel__role--on' : ''}`}
              onClick={() => setDriverRole(role)}
            >
              {DRIVER_ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      </div>

      <div className="dm-demo-panel__block">
        <span className="dm-demo-panel__label">Tài khoản đang đăng nhập</span>
        <div className="dm-demo-panel__roles">
          {MOCK_QUOTE_DRIVERS.map((driver) => (
            <button
              key={driver.id}
              type="button"
              className={`dm-demo-panel__role ${currentDriverId === driver.id ? 'dm-demo-panel__role--on' : ''}`}
              onClick={() => setCurrentDriverId(driver.id)}
            >
              {driver.name}
            </button>
          ))}
        </div>
      </div>

      <div className="dm-demo-panel__block">
        <span className="dm-demo-panel__label">Trạng thái đơn</span>
        <div className="dm-demo-panel__toggle">
          <button
            type="button"
            className={`dm-demo-panel__pill ${!demoHasOrders ? 'dm-demo-panel__pill--on' : ''}`}
            onClick={() => setDemoHasOrders(false)}
          >
            Chưa có đơn
          </button>
          <button
            type="button"
            className={`dm-demo-panel__pill ${demoHasOrders ? 'dm-demo-panel__pill--on' : ''}`}
            onClick={() => setDemoHasOrders(true)}
          >
            Có đơn
          </button>
        </div>
      </div>

      <div className="dm-demo-panel__block">
        <span className="dm-demo-panel__label">Màn cấp quyền</span>
        <div className="dm-demo-panel__toggle">
          <button
            type="button"
            className={`dm-demo-panel__pill ${locationGateOn ? 'dm-demo-panel__pill--on' : ''}`}
            onClick={() => setLocationGateOn(true)}
          >
            Bật
          </button>
          <button
            type="button"
            className={`dm-demo-panel__pill ${!locationGateOn ? 'dm-demo-panel__pill--on' : ''}`}
            onClick={() => setLocationGateOn(false)}
          >
            Tắt
          </button>
        </div>
      </div>

      <div className="dm-demo-panel__block">
        <span className="dm-demo-panel__label">Kết nối</span>
        <div className="dm-demo-panel__toggle">
          <button
            type="button"
            className={`dm-demo-panel__pill ${!poorConnection ? 'dm-demo-panel__pill--on' : ''}`}
            onClick={() => setPoorConnection(false)}
          >
            Ổn định
          </button>
          <button
            type="button"
            className={`dm-demo-panel__pill ${poorConnection ? 'dm-demo-panel__pill--on' : ''}`}
            onClick={() => setPoorConnection(true)}
          >
            Kém
          </button>
        </div>
      </div>

      <div className="dm-demo-panel__block">
        <span className="dm-demo-panel__label">Onboarding</span>
        <div className="dm-demo-panel__toggle">
          <button
            type="button"
            className="dm-demo-panel__pill"
            onClick={() => {
              resetOnboardingDone();
              if (isLoggedIn) navigate('/onboarding?replay=1');
            }}
          >
            Xem / reset hướng dẫn
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DemoControls;
