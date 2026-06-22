import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  DlsBrandButton,
  DlsHomeIndicator,
  DlsTextField,
  DlsTopNav,
} from '@dls/components';

const ExtraCostsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, updateOrder } = useApp();
  const order = getOrder(id ?? '');
  const [amount, setAmount] = React.useState('');
  const [note, setNote] = React.useState('');

  const handleSave = () => {
    const extra = Number(amount.replace(/\D/g, '')) || 0;
    if (order) {
      updateOrder(order.id, { extraCost: (order.extraCost ?? 0) + extra });
    }
    navigate(`/payment-wait/${id}`);
  };

  return (
    <div className="dm-screen">
      <DlsTopNav title="Chi phí phát sinh" onBack={() => navigate('/home')} />
      <div className="dls-auth-body">
        <DlsTextField
          label="Số tiền (VNĐ)"
          value={amount}
          onChange={setAmount}
          placeholder="100000"
          required
        />
        <DlsTextField label="Ghi chú" value={note} onChange={setNote} placeholder="Mô tả chi phí" />
        <DlsBrandButton onClick={handleSave} disabled={!amount}>
          Gửi yêu cầu thanh toán
        </DlsBrandButton>
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default ExtraCostsPage;
