import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DlsHomeIndicator, DlsTopNav } from '@dls/components';

const NotificationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifications } = useApp();
  const item = notifications.find((n) => n.id === id);

  return (
    <div className="dm-screen dm-screen--scroll">
      <DlsTopNav title="Thông báo" onBack={() => navigate('/notifications')} />
      <div className="dm-scroll-area dls-notification-detail">
        {item ? (
          <>
            <h2>{item.title}</h2>
            <time>{item.time}</time>
            <p>{item.body}</p>
          </>
        ) : (
          <p className="dm-empty">Không tìm thấy thông báo.</p>
        )}
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default NotificationDetailPage;
