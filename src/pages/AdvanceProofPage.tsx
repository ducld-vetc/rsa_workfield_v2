import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import RescueCameraCapture from '../components/RescueCameraCapture';
import {
  confirmDriverAdvance,
  getDriverAdvance,
  getDriverAdvanceVersion,
  subscribeDriverAdvances,
} from '../data/driverAdvances';
import { RescueOrder } from '../types';

const AdvanceProofPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useSyncExternalStore(subscribeDriverAdvances, getDriverAdvanceVersion);
  const item = getDriverAdvance(id ?? '');

  if (!item || item.status !== 'pending') {
    navigate('/advances', { replace: true });
    return null;
  }

  const order = {
    id: item.id,
    plate: item.plate,
    address: item.orderId,
    brand: '',
    model: '',
    timestamp: item.requestedAt,
    services: '',
    status: 'dang-cuu-ho',
    monthGroup: '',
  } as unknown as RescueOrder;

  const back = () => navigate(`/advances/${item.id}`, { replace: true });

  return (
    <RescueCameraCapture
      open
      order={order}
      guide={{
        code: 'A1',
        title: 'Ảnh chuyển khoản',
        hint: 'Chụp ủy nhiệm chi hoặc chọn ảnh từ thư viện',
        overlay: 'receipt',
        progress: '1/1',
      }}
      onClose={back}
      onReserve={() => ({ close: true, guide: null })}
      onDrop={() => undefined}
      onCommit={(_shotId, dataUrl) => {
        confirmDriverAdvance(item.id, 'Ảnh chuyển khoản', dataUrl);
        back();
      }}
    />
  );
};

export default AdvanceProofPage;
