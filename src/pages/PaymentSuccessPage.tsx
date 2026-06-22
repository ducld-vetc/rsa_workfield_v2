import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DlsBrandButton, DlsHomeIndicator, DlsTopNav } from '@dls/components';

const PaymentSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="dm-screen">
      <DlsTopNav title="Thanh toán" onBack={() => navigate('/home')} />
      <div className="dls-auth-body dls-auth-body--center">
        <div className="dls-success-icon">✓</div>
        <h2 className="dls-auth-title">Thanh toán thành công</h2>
        <p className="dls-auth-hint">Khách hàng đã thanh toán chi phí phát sinh.</p>
        <DlsBrandButton onClick={() => navigate('/home')}>Tiếp tục cứu hộ</DlsBrandButton>
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default PaymentSuccessPage;
