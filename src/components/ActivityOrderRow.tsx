import React from 'react';
import { Flag, MapPin } from 'lucide-react';
import { DlsStatusBadge } from '@dls/components';
import OrderHandlerLine from './OrderHandlerLine';
import AddressMapLink from './AddressMapLink';
import { useApp } from '../context/AppContext';
import {
  getRescueServiceMode,
  isTowRescueOrder,
  RescueOrder,
  SERVICE_MODE_LABELS,
} from '../types';
import {
  getActivityStatusDisplay,
  getHandlerDisplay,
} from '../utils/orderHandler';

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function formatTimestamp(timestamp: string): string {
  return timestamp.replace(/:00, /, ' · ').replace(/, /, ' · ');
}

function getServicesSummary(order: RescueOrder): string {
  if (order.serviceLines?.length) {
    return order.serviceLines.map((line) => line.name).join(' · ');
  }
  return order.services.replace(/;/g, ' · ');
}

function getTowDistanceKm(order: RescueOrder): string | null {
  const towLine = order.serviceLines?.find((line) =>
    line.name.toLowerCase().includes('kéo xe'),
  );
  if (!towLine?.value) return null;
  const match = towLine.value.match(/[\d.,]+/);
  return match ? `${match[0]} km` : towLine.value;
}

interface ActivityOrderRowProps {
  order: RescueOrder;
  onClick: () => void;
  canAssign?: boolean;
  onAssign?: () => void;
}

const ActivityOrderRow: React.FC<ActivityOrderRowProps> = ({
  order,
  onClick,
  canAssign = false,
  onAssign,
}) => {
  const { driverRole, currentDriverId } = useApp();
  const isTow = isTowRescueOrder(order);
  const serviceMode = getRescueServiceMode(order);
  const towDistance = getTowDistanceKm(order);
  const statusDisplay = getActivityStatusDisplay(order, driverRole, currentDriverId);
  const handlerDisplay = getHandlerDisplay(order, driverRole, currentDriverId);

  return (
    <article className={`grab-activity-row-card${canAssign && onAssign ? ' grab-activity-row-card--assignable' : ''}`}>
      <div
        className="grab-activity-row"
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
      >
        <div className="grab-activity-row__main">
          <div className="grab-activity-row__top">
            <span className="grab-activity-row__plate">{formatPlateDisplay(order.plate)}</span>
            <DlsStatusBadge
              label={statusDisplay.label}
              variant={statusDisplay.variant}
            />
          </div>

          <div className="grab-activity-row__meta">
            <span
              className={`grab-activity-row__mode grab-activity-row__mode--${isTow ? 'tow' : 'onsite'}`}
            >
              {SERVICE_MODE_LABELS[serviceMode]}
            </span>
            <span className="grab-activity-row__services">{getServicesSummary(order)}</span>
          </div>

          <ul className="rescue-sheet__stops grab-activity-row__stops">
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

          {(handlerDisplay.text || order.timestamp) && (
            <div className="grab-activity-row__footer">
              {handlerDisplay.text ? (
                <OrderHandlerLine display={handlerDisplay} />
              ) : (
                <p className="grab-activity-row__time">{formatTimestamp(order.timestamp)}</p>
              )}
            </div>
          )}

          {canAssign && onAssign && (
            <button
              type="button"
              className="quote-submit-btn grab-activity-row__assign-action"
              onClick={(e) => {
                e.stopPropagation();
                onAssign();
              }}
            >
              <span className="quote-submit-btn__text">Đổi tài xế</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ActivityOrderRow;
