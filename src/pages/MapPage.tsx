import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import RescueMap from '../components/RescueMap';
import { useApp } from '../context/AppContext';
import { DlsHomeIndicator, DlsTopNav } from '@dls/components';

const MapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder } = useApp();
  const order = getOrder(id ?? '');

  return (
    <div className="dm-screen">
      <DlsTopNav title="Bản đồ" onBack={() => navigate('/home')} />
      <div className="rescue-map rescue-map--fullscreen">
        {order ? <RescueMap order={order} /> : <p className="dm-empty">Không tìm thấy đơn.</p>}
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default MapPage;
