import React from 'react';
import {
  BatteryFull,
  Bell,
  Briefcase,
  CalendarDays,
  Camera,
  FileText,
  Flag,
  Headset,
  MapPin,
  Navigation,
  Phone,
  Signal,
  Siren,
  User,
  Wifi,
} from 'lucide-react';
import ActivityOrderRow from './ActivityOrderRow';
import MissionTaskCard from './MissionTaskCard';
import QuoteInboxPanel from './QuoteInboxPanel';
import RescueMap from './RescueMap';
import { DlsStatusBadge } from '@dls/components';
import { MOCK_ORDERS } from '../data/mockOrders';
import { MOCK_QUOTE_ORDERS } from '../data/mockQuoteOrders';
import { RescueOrder } from '../types';
import { OnboardingStepId } from '../utils/onboarding';

type TabId = 'home' | 'quotes' | 'activity' | 'notifications' | 'settings';

const GUIDE_TABS: { id: TabId; label: string; icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'home', label: 'Cứu hộ', icon: Siren },
  { id: 'quotes', label: 'Báo giá', icon: CalendarDays },
  { id: 'activity', label: 'Hoạt động', icon: Briefcase },
  { id: 'notifications', label: 'Thông báo', icon: Bell },
  { id: 'settings', label: 'Tài khoản', icon: User },
];

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

const GuideTabBar: React.FC<{ active: TabId; badgeQuotes?: number }> = ({
  active,
  badgeQuotes = 0,
}) => (
  <nav className="grab-tabbar" aria-hidden>
    {GUIDE_TABS.map(({ id, label, icon: Icon }) => {
      const on = active === id;
      return (
        <span
          key={id}
          className={`grab-tabbar__item ${on ? 'grab-tabbar__item--on' : ''}`}
        >
          <span className="grab-tabbar__icon-wrap">
            <Icon size={22} strokeWidth={on ? 2.25 : 1.75} />
            {id === 'quotes' && badgeQuotes > 0 && (
              <span className="grab-tabbar__badge">{badgeQuotes}</span>
            )}
          </span>
          <span>{label}</span>
        </span>
      );
    })}
  </nav>
);

const GuideFrame: React.FC<{
  children: React.ReactNode;
  highlight?: 'quote-cta' | 'accept-cta' | 'operate-cta' | 'track-row';
}> = ({ children, highlight }) => (
  <div
    className={`guide-phone-frame${highlight ? ` guide-phone-frame--${highlight}` : ''}`}
    aria-hidden
  >
    <div className="guide-snap">
      <div className="guide-snap__scale">
        <div className="guide-snap__status">
          <span className="guide-snap__status-time">9:41</span>
          <div className="guide-snap__island" />
          <div className="guide-snap__status-icons">
            <Signal size={15} strokeWidth={2.25} />
            <Wifi size={15} strokeWidth={2.25} />
            <BatteryFull size={20} strokeWidth={1.75} />
          </div>
        </div>
        {children}
        <div className="guide-snap__home">
          <div className="guide-snap__home-bar" />
        </div>
      </div>
    </div>
  </div>
);

const QuoteScene: React.FC = () => {
  const order = { ...MOCK_QUOTE_ORDERS[0], quoteCountdownSeconds: 0 };
  return (
    <GuideFrame highlight="quote-cta">
      <div className="dm-shell dm-shell--tabs guide-snap__shell">
        <div className="dm-shell__body">
          <div className="quote-inbox-page quote-inbox-page--panel">
            <div className="quote-inbox-page__top">
              <header className="quote-inbox-page__header">
                <h1>Báo giá</h1>
                <p className="quote-inbox-page__header-sub">Quản lý báo giá cứu hộ</p>
              </header>
              <div className="quote-segment" role="presentation">
                <span className="quote-segment__btn quote-segment__btn--on">
                  <span className="quote-segment__label">Chờ báo giá</span>
                  <span className="quote-segment__badge">1</span>
                </span>
                <span className="quote-segment__btn">
                  <span className="quote-segment__label">Đã gửi</span>
                </span>
              </div>
            </div>
            <div className="quote-inbox-page__body">
              <QuoteInboxPanel
                order={order}
                queueRemaining={0}
                driverRole="quote-rescue"
                onSubmit={() => undefined}
                onSkip={() => undefined}
              />
            </div>
          </div>
        </div>
        <GuideTabBar active="quotes" badgeQuotes={1} />
      </div>
    </GuideFrame>
  );
};

const AcceptScene: React.FC = () => {
  const order: RescueOrder = {
    ...MOCK_ORDERS[0],
    status: 'cho-nhan',
    jobStage: 'cho-nhan',
    acceptCountdown: '30:00',
  };
  return (
    <GuideFrame highlight="accept-cta">
      <div className="dm-shell dm-shell--tabs guide-snap__shell">
        <div className="dm-shell__body">
          <div className="grab-activity">
            <header className="grab-page-header">
              <h1>Hoạt động</h1>
              <p>1 đơn chờ nhận</p>
            </header>
            <div className="grab-activity__scroll">
              <section className="mission-home__section" aria-label="Nhiệm vụ được giao">
                <div className="mission-home__section-head">
                  <h2>Được giao</h2>
                  <span className="mission-home__count">1</span>
                </div>
                <div className="mission-home__list">
                  <MissionTaskCard
                    order={order}
                    onAccept={() => undefined}
                    onReject={() => undefined}
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
        <GuideTabBar active="activity" />
      </div>
    </GuideFrame>
  );
};

const OperateScene: React.FC = () => {
  const activeJob: RescueOrder = {
    ...MOCK_ORDERS[2],
    status: 'dang-cuu-ho',
    jobStage: 'da-nhan',
  };
  return (
    <GuideFrame highlight="operate-cta">
      <div className="dm-shell dm-shell--tabs guide-snap__shell">
        <div className="dm-shell__body">
          <div className="rescue-live">
            <div className="rescue-live__map">
              <RescueMap order={activeJob} />
              <a className="rescue-live__cskh-btn" href="#guide" tabIndex={-1}>
                <Headset size={18} strokeWidth={2} />
              </a>
              <div className="rescue-map-tools rescue-map-tools--bottom">
                <div className="rescue-live__route-pill">
                  <Navigation size={14} />
                  25 phút · 12 km
                </div>
                <span className="rescue-live__nav-fab">
                  <Navigation size={18} />
                  Chỉ đường
                </span>
              </div>
            </div>

            <div className="rescue-sheet">
              <div className="rescue-sheet__head">
                <div className="rescue-sheet__identity">
                  <DlsStatusBadge label="Đang cứu hộ" variant="success" showDot={false} />
                  <h2 className="rescue-sheet__plate">
                    {formatPlateDisplay(activeJob.plate)}
                  </h2>
                  <p className="rescue-sheet__vehicle">
                    {activeJob.brand} {activeJob.model}
                    {activeJob.condition ? ` · ${activeJob.condition}` : ''}
                  </p>
                </div>
                <div className="rescue-sheet__head-aside">
                  <DlsStatusBadge label="Đang tới điểm" variant="warning" showDot={false} />
                  <span className="rescue-sheet__call-btn">
                    <Phone size={20} strokeWidth={2} />
                  </span>
                </div>
              </div>

              <ul className="rescue-sheet__stops">
                <li className="rescue-sheet__stop">
                  <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--pickup" aria-hidden>
                    <MapPin size={15} strokeWidth={2.25} />
                  </span>
                  <div className="rescue-sheet__stop-body">
                    <span className="rescue-sheet__stop-label">Điểm cứu hộ</span>
                    <p className="rescue-sheet__address-link">{activeJob.address}</p>
                  </div>
                </li>
                {activeJob.towDestination && (
                  <li className="rescue-sheet__stop">
                    <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--tow" aria-hidden>
                      <Flag size={14} strokeWidth={2.25} />
                    </span>
                    <div className="rescue-sheet__stop-body">
                      <span className="rescue-sheet__stop-label">Điểm kéo xe về</span>
                      <p className="rescue-sheet__address-link">{activeJob.towDestination}</p>
                    </div>
                  </li>
                )}
              </ul>

              <div className="rescue-sheet__actions-row guide-snap__actions">
                <button
                  type="button"
                  className="rescue-sheet__action-btn rescue-sheet__action-btn--icon"
                  tabIndex={-1}
                  aria-label="Chi tiết đơn"
                >
                  <FileText size={20} strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  className="rescue-sheet__action-btn rescue-sheet__action-btn--icon"
                  tabIndex={-1}
                  aria-label="Chụp ảnh hiện trường"
                >
                  <Camera size={20} strokeWidth={1.75} />
                </button>
                <div className="guide-snap__cta-wrap">
                  <button
                    type="button"
                    className="grab-btn-accept rescue-sheet__action-btn--primary guide-snap__primary-cta"
                    tabIndex={-1}
                  >
                    Đã đến điểm cứu hộ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <GuideTabBar active="home" />
      </div>
    </GuideFrame>
  );
};

const TrackScene: React.FC = () => {
  const rows = [MOCK_ORDERS[3], MOCK_ORDERS[0]];
  return (
    <GuideFrame highlight="track-row">
      <div className="dm-shell dm-shell--tabs guide-snap__shell">
        <div className="dm-shell__body">
          <div className="grab-activity">
            <header className="grab-page-header">
              <h1>Hoạt động</h1>
              <p>Xem đơn của đơn vị · có thể đổi tài xế</p>
            </header>
            <div className="grab-activity__scroll">
              <section className="grab-activity__section" aria-label="Danh sách đơn">
                <div className="mission-home__section-head">
                  <h2>Tất cả đơn</h2>
                  <span className="mission-home__count">2</span>
                </div>
                <div className="grab-activity__list">
                  {rows.map((order) => (
                    <ActivityOrderRow
                      key={order.id}
                      order={order}
                      onClick={() => undefined}
                    />
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
        <GuideTabBar active="activity" />
      </div>
    </GuideFrame>
  );
};

const SCENES: Record<OnboardingStepId, React.FC> = {
  quote: QuoteScene,
  accept: AcceptScene,
  operate: OperateScene,
  track: TrackScene,
};

export const OnboardingVisual: React.FC<{ stepId: OnboardingStepId }> = ({ stepId }) => {
  const Scene = SCENES[stepId];
  return (
    <div className="grab-guide__stage" key={stepId}>
      <Scene />
    </div>
  );
};
