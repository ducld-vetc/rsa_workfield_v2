import React, { useState } from 'react';
import { Check, ChevronLeft, Copy } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import { DlsHomeIndicator } from '@dls/components';
import ReasonSheet from '../components/ReasonSheet';
import {
  ADVANCE_REJECT_REASONS,
  DRIVER_PAYER_LABEL,
  DRIVER_PURPOSE_LABEL,
  DRIVER_STATUS_LABEL,
  getDriverAdvance,
  getDriverAdvanceVersion,
  rejectDriverAdvance,
  subscribeDriverAdvances,
} from '../data/driverAdvances';

const formatMoney = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

const transferContent = (orderId: string, purpose: 'refund_customer' | 'pay_supplier') =>
  `${orderId} ${purpose === 'refund_customer' ? 'HOAN KHACH' : 'TRA NCC'}`;

const TapRow: React.FC<{
  label: string;
  value: string;
  copyValue?: string;
  remain?: boolean;
  copyIcon?: boolean;
  emphasis?: boolean;
}> = ({ label, value, copyValue, remain, copyIcon, emphasis }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={`${remain ? 'order-detail-cost__remain' : 'order-detail-cost__row'} drv-advance-tap`}
      onClick={() => {
        navigator.clipboard.writeText(copyValue ?? value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
    >
      <span>{label}</span>
      <span className="drv-advance-value">
        <span className={emphasis ? 'drv-advance-emph' : undefined}>{value}</span>
        {copyIcon && (
          <span className="drv-advance-copy-icon" aria-hidden>
            {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} strokeWidth={2} />}
          </span>
        )}
      </span>
    </button>
  );
};

const AdvanceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useSyncExternalStore(subscribeDriverAdvances, getDriverAdvanceVersion);
  const item = getDriverAdvance(id ?? '');
  const [rejectOpen, setRejectOpen] = useState(false);
  const [preview, setPreview] = useState<{ label: string; url: string } | null>(null);

  if (!item) {
    return (
      <div className="dm-screen">
        <div className="rescue-sheet order-detail-sheet">
          <header className="grab-page-header">
            <div className="drv-vehicle-header__main">
              <button type="button" className="drv-vehicle-back" onClick={() => navigate('/advances')} aria-label="Quay lại">
                <ChevronLeft size={24} strokeWidth={2} />
              </button>
              <h1>Yêu cầu ứng tiền</h1>
            </div>
          </header>
          <div className="order-detail-sheet__scroll order-detail-sheet__scroll--tail">
            <p className="order-detail-condition__desc">Không tìm thấy yêu cầu.</p>
          </div>
        </div>
        <DlsHomeIndicator />
      </div>
    );
  }

  const pending = item.status === 'pending';
  const content = transferContent(item.orderId, item.purpose);
  const qrFiles = item.attachments.filter((file) => /qr/i.test(file.label));
  const cccdFiles = item.attachments.filter((file) => /cccd/i.test(file.label));

  const handleReject = (reason: string) => {
    rejectDriverAdvance(item.id, reason);
    setRejectOpen(false);
  };

  return (
    <div className="dm-screen">
      <div className="rescue-sheet order-detail-sheet">
        <header className="grab-page-header">
          <div className="drv-vehicle-header__main">
            <button type="button" className="drv-vehicle-back" onClick={() => navigate('/advances')} aria-label="Quay lại">
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <div>
              <div className="drv-vehicle-title">
                <h1>{item.orderId}</h1>
                <span className={`drv-vehicle-status drv-vehicle-status--${item.status}`}>
                  {DRIVER_STATUS_LABEL[item.status]}
                </span>
              </div>
              <p className="drv-detail-kicker">{item.plate} · {item.requestedAt}</p>
            </div>
          </div>
        </header>
        <div className={`order-detail-sheet__scroll${pending ? '' : ' order-detail-sheet__scroll--tail'}`}>
          <div className="order-detail-cost">
            <p className="order-detail-cost__title">Yêu cầu</p>
            <div className="order-detail-cost__row">
              <span>Người yêu cầu</span>
              <span>{item.requestedBy}</span>
            </div>
            <div className="order-detail-cost__row">
              <span>Loại yêu cầu</span>
              <span>{DRIVER_PURPOSE_LABEL[item.purpose]}</span>
            </div>
            <div className="order-detail-cost__row">
              <span>Người hoàn ứng</span>
              <span>{DRIVER_PAYER_LABEL[item.reimburseBy]}</span>
            </div>
            <div className="order-detail-cost__row">
              <span>Lý do</span>
              <span>{item.reason}</span>
            </div>
          </div>

          <div className="order-detail-cost">
            <p className="order-detail-cost__title">Chuyển khoản</p>
            <TapRow copyIcon label="Ngân hàng thụ hưởng" value={item.bank} />
            <TapRow copyIcon label="Số tài khoản" value={item.account} />
            <TapRow copyIcon emphasis label="Nội dung" value={content} />
            <TapRow
              remain
              copyIcon
              emphasis
              label="Số tiền"
              value={formatMoney(item.requestedAmount)}
              copyValue={String(item.requestedAmount)}
            />
          </div>

          <div className="order-detail-cost">
            <p className="order-detail-cost__title">Ghi chú</p>
            <p className="drv-advance-note">{item.note || '—'}</p>
          </div>

          {(qrFiles.length > 0 || cccdFiles.length > 0) && (
            <div className="order-detail-cost">
              {qrFiles.length > 0 && (
                <>
                  <p className="order-detail-cost__title">QR chuyển khoản</p>
                  <div className="drv-advance-files drv-advance-files--one">
                    {qrFiles.map((file) => (
                      <button key={file.label} type="button" className="drv-advance-file" onClick={() => setPreview(file)}>
                        <img src={file.url} alt={file.label} />
                      </button>
                    ))}
                  </div>
                </>
              )}
              {cccdFiles.length > 0 && (
                <>
                  <p className="order-detail-cost__title">CCCD</p>
                  <div className="drv-advance-files drv-advance-files--pair">
                    {cccdFiles.map((file) => (
                      <button key={file.label} type="button" className="drv-advance-file" onClick={() => setPreview(file)}>
                        <img src={file.url} alt={file.label} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {item.status === 'confirmed' && (
            <div className="order-detail-photos">
              <p className="order-detail-photos__title">Đã ghi nhận thành công</p>
              <p className="order-detail-condition__desc">{formatMoney(item.actualAmount ?? item.requestedAmount)}</p>
              {item.proofUrl ? (
                <img src={item.proofUrl} alt={item.proofLabel} className="drv-advance-proof" />
              ) : (
                <p className="order-detail-condition__desc">{item.proofLabel || 'Đã tải ảnh chuyển khoản'}</p>
              )}
            </div>
          )}

          {item.status === 'rejected' && (
            <div className="order-detail-condition">
              <p className="order-detail-condition__title">Từ chối</p>
              <p className="order-detail-condition__desc">{item.rejectReason}</p>
            </div>
          )}
        </div>

        {pending && (
          <div className="order-detail-sheet__footer">
            <div className="rescue-sheet__actions-row">
              <button type="button" className="rescue-sheet__action-btn rescue-sheet__action-btn--ghost" onClick={() => setRejectOpen(true)}>
                Từ chối
              </button>
              <button
                type="button"
                className="grab-btn-accept rescue-sheet__action-btn--primary"
                onClick={() => navigate(`/advances/${item.id}/proof`)}
              >
                Hoàn thành
              </button>
            </div>
          </div>
        )}
      </div>
      <ReasonSheet
        open={rejectOpen}
        title="Lý do từ chối"
        reasons={[...ADVANCE_REJECT_REASONS]}
        onClose={() => setRejectOpen(false)}
        onConfirm={handleReject}
      />
      {preview && (
        <div className="rescue-camera-live" role="dialog" aria-modal onClick={() => setPreview(null)}>
          <img src={preview.url} alt={preview.label} className="drv-advance-preview" />
        </div>
      )}
      <DlsHomeIndicator />
    </div>
  );
};

export default AdvanceDetailPage;
