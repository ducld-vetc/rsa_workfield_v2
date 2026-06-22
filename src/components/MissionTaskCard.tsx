import React from 'react';
import { ArrowLeftRight, Flag, MapPin } from 'lucide-react';
import ProgressCountdownButton from './ProgressCountdownButton';
import AddressMapLink from './AddressMapLink';
import { RescueOrder } from '../types';
import { parseCountdownSeconds } from '../utils/countdown';

interface MissionTaskCardProps {
  order: RescueOrder;
  canAssign?: boolean;
  acceptDisabled?: boolean;
  onAccept?: () => void;
  onReject?: () => void;
  onExpire?: () => void;
  onAssign?: () => void;
}

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function formatOrderCodeDisplay(code: string): string {
  return code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function getTowDistanceKm(order: RescueOrder): string | null {
  const towLine = order.serviceLines?.find((line) =>
    line.name.toLowerCase().includes('kéo xe'),
  );
  if (!towLine?.value) return null;
  const match = towLine.value.match(/[\d.,]+/);
  return match ? `${match[0]} km` : towLine.value;
}

const MissionTaskCard: React.FC<MissionTaskCardProps> = ({
  order,
  canAssign = false,
  acceptDisabled = false,
  onAccept,
  onReject,
  onExpire,
  onAssign,
}) => {
  const countdownSeconds = parseCountdownSeconds(order.acceptCountdown);
  const towDistance = getTowDistanceKm(order);

  return (
    <article className="quote-card mission-task-card">
      <div className="mission-task-card__head">
        <div className="mission-task-card__title-row">
          <h2 className="mission-task-card__plate">{formatPlateDisplay(order.plate)}</h2>
          {order.orderCode && (
            <span className="mission-task-card__code">
              {formatOrderCodeDisplay(order.orderCode)}
            </span>
          )}
        </div>
        <p className="mission-task-card__vehicle">
          {order.brand} {order.model}
        </p>
      </div>

      <ul className="rescue-sheet__stops">
        <li className="rescue-sheet__stop">
          <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--pickup" aria-hidden>
            <MapPin size={15} strokeWidth={2.25} />
          </span>
          <div className="rescue-sheet__stop-body">
            <div className="mission-task-card__stop-head">
              <span className="rescue-sheet__stop-label">Điểm cứu hộ</span>
              {order.distanceKm != null && (
                <span className="mission-task-card__distance">{order.distanceKm} km</span>
              )}
            </div>
            <AddressMapLink address={order.address} coords={order.pickupCoords} />
          </div>
        </li>
        {order.towDestination && (
          <li className="rescue-sheet__stop">
            <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--tow" aria-hidden>
              <Flag size={14} strokeWidth={2.25} />
            </span>
            <div className="rescue-sheet__stop-body">
              <div className="mission-task-card__stop-head">
                <span className="rescue-sheet__stop-label">Điểm kéo xe về</span>
                {towDistance && (
                  <span className="mission-task-card__distance mission-task-card__distance--tow">
                    {towDistance}
                  </span>
                )}
              </div>
              <AddressMapLink
                address={order.towDestination}
                coords={order.towCoords}
              />
            </div>
          </li>
        )}
      </ul>

      {order.condition && (
        <section className="mission-task-card__description" aria-label="Mô tả sự cố">
          <p>{order.condition}</p>
        </section>
      )}

      <div className="rescue-sheet__actions-row">
        {canAssign && (
          <button
            type="button"
            className="rescue-sheet__action-btn rescue-sheet__action-btn--icon"
            onClick={onAssign}
            aria-label="Phân công tài xế khác"
            title="Phân công tài xế khác"
          >
            <ArrowLeftRight size={20} strokeWidth={1.75} />
          </button>
        )}
        <button
          type="button"
          className="rescue-sheet__action-btn rescue-sheet__action-btn--ghost mission-task-card__reject"
          onClick={onReject}
        >
          Từ chối
        </button>
        <div className="mission-task-card__accept">
          <ProgressCountdownButton
            key={`${order.id}-${countdownSeconds}`}
            label="Nhận đơn"
            initialSeconds={countdownSeconds}
            disabled={acceptDisabled}
            onClick={() => onAccept?.()}
            onExpire={onExpire}
            expireDialog={{
              title: 'Hết thời gian nhận đơn',
              message: 'Đơn đã hết hạn nhận. Vui lòng chờ nhiệm vụ tiếp theo.',
              confirmLabel: 'Đã hiểu',
            }}
          />
        </div>
      </div>
    </article>
  );
};

export default MissionTaskCard;
