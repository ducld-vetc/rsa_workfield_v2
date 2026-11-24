import React, { useSyncExternalStore } from 'react';
import { Wallet, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DRIVER_PAYER_LABEL,
  DRIVER_PURPOSE_LABEL,
  getDriverAdvanceVersion,
  listDriverAdvances,
  subscribeDriverAdvances,
} from '../data/driverAdvances';

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

const AdvanceArrivalNotice: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  useSyncExternalStore(subscribeDriverAdvances, getDriverAdvanceVersion);
  const item = listDriverAdvances().find((row) => row.status === 'pending');
  const [pushOpen, setPushOpen] = React.useState(true);
  const [popupOpen, setPopupOpen] = React.useState(true);

  if (!isLoggedIn || !item || (!pushOpen && !popupOpen)) return null;

  const summary = `${item.orderId} · ${DRIVER_PURPOSE_LABEL[item.purpose]} · Hoàn ứng ${DRIVER_PAYER_LABEL[item.reimburseBy]} · ${formatMoney(item.requestedAmount)}`;

  const openDetail = () => {
    setPushOpen(false);
    setPopupOpen(false);
    navigate(`/advances/${item.id}`);
  };

  return (
    <>
      {pushOpen && (
        <div className="drv-push" role="status">
          <button type="button" className="drv-push__open" onClick={openDetail}>
            <span className="drv-push__icon" aria-hidden>
              <Wallet size={16} strokeWidth={2.25} />
            </span>
            <span className="drv-push__copy">
              <span className="drv-push__top">
                <span className="drv-push__time">bây giờ</span>
              </span>
              <strong>Yêu cầu ứng tiền mới</strong>
              <span className="drv-push__body">{summary}</span>
            </span>
          </button>
          <button
            type="button"
            className="drv-push__close"
            aria-label="Đóng thông báo đẩy"
            onClick={() => setPushOpen(false)}
          >
            <X size={14} strokeWidth={2.25} />
          </button>
        </div>
      )}
      {popupOpen && (
        <div
          className="drv-advance-popup"
          role="dialog"
          aria-modal
          aria-labelledby="advance-popup-title"
          onClick={() => setPopupOpen(false)}
        >
          <div className="drv-advance-popup__card" onClick={(event) => event.stopPropagation()}>
            <p className="drv-advance-popup__kicker">Thông báo</p>
            <h2 id="advance-popup-title">Có yêu cầu ứng tiền mới</h2>
            <p className="drv-advance-popup__summary">{summary}</p>
            <p className="drv-advance-popup__meta">
              {item.plate} · {item.requestedBy}
            </p>
            <p className="drv-advance-popup__hint">Đã thêm vào mục Thông báo.</p>
            <div className="drv-advance-popup__actions">
              <button type="button" className="drv-advance-popup__later" onClick={() => setPopupOpen(false)}>
                Để sau
              </button>
              <button type="button" className="drv-advance-popup__open" onClick={openDetail}>
                Xem yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvanceArrivalNotice;
