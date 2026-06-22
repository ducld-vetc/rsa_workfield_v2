import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';
import { EmptyState } from '../components/EmptyState';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  const subtitle = (() => {
    if (notifications.length === 0) return 'Chưa có thông báo';
    if (unread > 0) return `${unread} thông báo chưa đọc`;
    return `${notifications.length} thông báo`;
  })();

  return (
    <MainShell>
      <div className="grab-activity grab-notifications">
        <header className="grab-page-header">
          <h1>Thông báo</h1>
          <p>{subtitle}</p>
        </header>

        <div className="grab-activity__scroll">
          <section className="grab-activity__section" aria-label="Danh sách thông báo">
            <div className="grab-activity__list">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`grab-notif-row${n.read ? '' : ' grab-notif-row--unread'}`}
                  onClick={() => navigate(`/notifications/${n.id}`)}
                >
                  <div className="grab-notif-row__main">
                    <div className="grab-notif-row__top">
                      <p className="grab-notif-row__title">{n.title}</p>
                      <time className="grab-notif-row__time">{n.time}</time>
                    </div>
                    <p className="grab-notif-row__body">{n.body}</p>
                  </div>
                </button>
              ))}
              {notifications.length === 0 && (
                <EmptyState
                  title="Không có thông báo"
                  hint="Thông báo về đơn cứu hộ và thanh toán sẽ hiện tại đây."
                />
              )}
            </div>
          </section>
        </div>
      </div>
    </MainShell>
  );
};

export default NotificationsPage;
