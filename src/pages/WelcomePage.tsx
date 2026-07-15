import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DlsHomeIndicator } from '@dls/components';
import vetcCuuHoLogo from '../assets/vetc-cuu-ho-logo.png';
import welcomeHero from '../assets/welcome-hero.png';

/** Màn thumbnail — khuyến khích đăng ký Trạm Quick Service (style landing Lyft). */
const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dm-screen grab-welcome">
      <div className="grab-welcome__bg" aria-hidden>
        <img src={welcomeHero} alt="" className="grab-welcome__photo" />
        <div className="grab-welcome__scrim" />
      </div>

      <header className="grab-welcome__top">
        <img src={vetcCuuHoLogo} alt="VETC Cứu Hộ" className="grab-welcome__logo" />
      </header>

      <div className="grab-welcome__bottom">
        <h1 className="grab-welcome__headline">
          Cùng VETC mở rộng mạng lưới cứu hộ
        </h1>
        <p className="grab-welcome__sub">
          Đăng ký Trạm Quick Service để nhận đơn và đồng hành cùng hệ thống cứu hộ toàn quốc 24/7.
        </p>

        <button
          type="button"
          className="grab-welcome__cta"
          onClick={() => navigate('/register-quick-service')}
        >
          Đăng ký ngay
        </button>

        <button
          type="button"
          className="grab-welcome__signin"
          onClick={() => navigate('/sign-in')}
        >
          Đã có tài khoản? Đăng nhập →
        </button>
      </div>

      <DlsHomeIndicator />
    </div>
  );
};

export default WelcomePage;
