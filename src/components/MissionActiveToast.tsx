import React from 'react';
import { Siren } from 'lucide-react';
import AddressMapLink from './AddressMapLink';
import { JobStage, RescueOrder } from '../types';

interface MissionActiveToastProps {
  order: RescueOrder;
  onOpen: () => void;
}

const STAGE_PROGRESS: Partial<Record<JobStage, number>> = {
  'da-nhan': 22,
  'da-den-diem': 72,
  'dang-keo': 48,
  'hoan-thanh': 100,
};

function getTravelProgress(order: RescueOrder): number {
  if (order.travelProgress != null) {
    return Math.min(100, Math.max(0, order.travelProgress));
  }
  if (order.jobStage && STAGE_PROGRESS[order.jobStage] != null) {
    return STAGE_PROGRESS[order.jobStage]!;
  }
  return 35;
}

function formatMetrics(order: RescueOrder): string | null {
  const parts: string[] = [];
  if (order.distanceKm != null) {
    parts.push(`${order.distanceKm} km`);
  }
  if (order.etaMinutes != null) {
    parts.push(`${order.etaMinutes} phút`);
  }
  return parts.length > 0 ? parts.join(', ') : null;
}

function formatRemaining(order: RescueOrder, progress: number): string {
  if (order.distanceKm != null) {
    const remainingKm = Math.max(0.1, order.distanceKm * (1 - progress / 100));
    const rounded = remainingKm < 1
      ? `${Math.round(remainingKm * 10) / 10} km`
      : `${Math.round(remainingKm)} km`;
    return `Còn ~${rounded}`;
  }
  if (progress >= 92) return 'Sắp tới';
  if (progress >= 60) return 'Gần điểm';
  return 'Đang di chuyển';
}

const MissionActiveToast: React.FC<MissionActiveToastProps> = ({ order, onOpen }) => {
  const metrics = formatMetrics(order);
  const progress = getTravelProgress(order);
  const remainingLabel = formatRemaining(order, progress);

  return (
    <div className="mission-active-toast-anchor">
      <span className="mission-active-toast-anchor__pin" aria-hidden />
      <button
        type="button"
        className="mission-active-toast"
        onClick={onOpen}
        aria-label={`Đang cứu hộ — ${order.address}. Tiến độ ${Math.round(progress)}%. Nhấn để xem chi tiết`}
      >
        <div className="mission-active-toast__progress-head">
          <span className="mission-active-toast__progress-label">Tới điểm cứu hộ</span>
          <span className="mission-active-toast__progress-remaining">{remainingLabel}</span>
        </div>
        <div
          className="mission-active-toast__progress-track"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Tiến độ di chuyển tới điểm cứu hộ"
        >
          <span
            className="mission-active-toast__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mission-active-toast__row">
          <Siren size={22} strokeWidth={2} className="mission-active-toast__icon" aria-hidden />
          <span className="mission-active-toast__badge">Đang cứu hộ</span>
          {metrics && (
            <span className="mission-active-toast__metrics">{metrics}</span>
          )}
        </div>
        <AddressMapLink
          as="span"
          className="mission-active-toast__addr"
          address={order.address}
          coords={order.pickupCoords}
        />
      </button>
    </div>
  );
};

export default MissionActiveToast;
