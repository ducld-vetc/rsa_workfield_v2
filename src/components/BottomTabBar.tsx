import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, Briefcase, CalendarDays, Siren, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { hasRescueTabLiveJob } from '../utils/orderHandler';

const BottomTabBar: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    driverRole,
    notifications,
    orders,
    quoteOrders,
    skippedQuoteIds,
    demoHasOrders,
    currentDriverId,
  } = useApp();
  const unread = notifications.filter((n) => !n.read).length;
  const hasActiveRescue = hasRescueTabLiveJob(orders, driverRole, currentDriverId);
  const pendingQuotes = demoHasOrders
    ? quoteOrders.filter(
        (o) => o.quoteStatus === 'cho-bao-gia' && !skippedQuoteIds.includes(o.id),
      ).length
    : 0;

  const tabs =
    driverRole === 'quote-rescue'
      ? [
          { path: '/home', label: 'Cứu hộ', icon: Siren, live: hasActiveRescue },
          {
            path: '/quotes',
            label: 'Báo giá',
            icon: CalendarDays,
            badge: pendingQuotes,
          },
          { path: '/activity', label: 'Hoạt động', icon: Briefcase },
          { path: '/notifications', label: 'Thông báo', icon: Bell, badge: unread },
          { path: '/settings', label: 'Tài khoản', icon: User },
        ]
      : driverRole === 'quote-only'
        ? [
            { path: '/quotes', label: 'Báo giá', icon: CalendarDays, badge: pendingQuotes },
            { path: '/activity', label: 'Hoạt động', icon: Briefcase },
            { path: '/notifications', label: 'Thông báo', icon: Bell, badge: unread },
            { path: '/settings', label: 'Tài khoản', icon: User },
          ]
        : [
            { path: '/home', label: 'Cứu hộ', icon: Siren, live: hasActiveRescue },
            { path: '/activity', label: 'Hoạt động', icon: Briefcase },
            { path: '/notifications', label: 'Thông báo', icon: Bell, badge: unread },
            { path: '/settings', label: 'Tài khoản', icon: User },
          ];

  const active =
    tabs.find((t) => pathname === t.path || pathname.startsWith(`${t.path}/`))?.path ??
    tabs[0].path;

  return (
    <nav className="grab-tabbar" aria-label="Điều hướng chính">
      {tabs.map(({ path, label, icon: Icon, badge, live }) => {
        const on = active === path;
        return (
          <button
            key={path}
            type="button"
            className={`grab-tabbar__item ${on ? 'grab-tabbar__item--on' : ''}`}
            onClick={() => navigate(path)}
            aria-current={on ? 'page' : undefined}
          >
            <span className="grab-tabbar__icon-wrap">
              <Icon size={22} strokeWidth={on ? 2.25 : 1.75} />
              {live && <span className="grab-tabbar__live" aria-label="Đang cứu hộ" />}
              {badge != null && badge > 0 && (
                <span className="grab-tabbar__badge">{badge}</span>
              )}
            </span>
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomTabBar;
