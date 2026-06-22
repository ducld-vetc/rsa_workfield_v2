import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DlsBrandButton, DlsHomeIndicator, DlsTopNav } from '@dls/components';

const PaymentWaitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder } = useApp();
  const order = getOrder(id ?? '');

  return (
    <div className="dm-screen">
      <DlsTopNav title="Chờ thanh toán" onBack={() => navigate('/home')} />
      <div className="dls-auth-body dls-auth-body--center">
        <div className="dls-wait-icon">⏳</div>
        <h2 className="dls-auth-title">Đang chờ khách thanh toán</h2>
        <p className="dls-auth-hint">
          Chi phí phát sinh: {(order?.extraCost ?? 0).toLocaleString('vi-VN')} đ
        </p>
        <DlsBrandButton onClick={() => navigate(`/payment-success/${id}`)}>
          Mô phỏng thanh toán thành công
        </DlsBrandButton>
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default PaymentWaitPage;
