import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Camera,
  FileText,
  Flag,
  Headset,
  MapPin,
  Moon,
  Navigation,
  Phone,
  Plus,
  Siren,
} from 'lucide-react';
import RatingSheet from '../components/RatingSheet';
import RescueMap from '../components/RescueMap';
import AddressMapLink from '../components/AddressMapLink';
import MainShell from '../layouts/MainShell';
import { useApp } from '../context/AppContext';
import { DlsStatusBadge } from '@dls/components';
import { JOB_STAGE_LABELS, JobStage, RescueOrder } from '../types';
import { getRescueEmptyCopy, getRescueTabActiveJob } from '../utils/orderHandler';

const STAGE_ACTIONS: Record<JobStage, { label: string; next?: JobStage }> = {
  'cho-nhan': { label: 'Nhận đơn', next: 'da-nhan' },
  'da-nhan': { label: 'Đã đến điểm cứu hộ', next: 'da-den-diem' },
  'da-den-diem': { label: 'Bắt đầu kéo xe', next: 'dang-keo' },
  'dang-keo': { label: 'Hoàn thành cứu hộ', next: 'hoan-thanh' },
  'hoan-thanh': { label: 'Hoàn thành', next: undefined },
};

const MOCK_CUSTOMER_PHONE = '1900123456';
const MOCK_CSKH_PHONE = '19001888';

function getStageChipLabel(stage: JobStage, hasTow: boolean): string {
  if (stage === 'dang-keo' && hasTow) return 'Đang kéo xe về';
  if (stage === 'da-nhan') return 'Đang tới điểm';
  return JOB_STAGE_LABELS[stage];
}

function getStageChipVariant(stage: JobStage): 'success' | 'info' | 'warning' | 'neutral' {
  if (stage === 'dang-keo') return 'info';
  if (stage === 'da-den-diem' || stage === 'da-nhan') return 'warning';
  if (stage === 'hoan-thanh') return 'neutral';
  return 'success';
}

function formatPlateDisplay(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

function getCustomerPhone(order: RescueOrder): string {
  return order.customerPhone ?? MOCK_CUSTOMER_PHONE;
}

type SecondaryAction = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

function getSecondaryAction(
  stage: JobStage,
  order: RescueOrder,
  navigate: ReturnType<typeof useNavigate>,
): SecondaryAction | null {
  if (stage === 'da-den-diem') {
    return {
      label: 'Chụp ảnh hiện trường',
      icon: <Camera size={20} strokeWidth={1.75} />,
      onClick: () => navigate(`/jobs/${order.id}/camera?type=qua-trinh`),
    };
  }
  if (stage === 'dang-keo') {
    return {
      label: 'Phí phát sinh',
      icon: <Plus size={20} strokeWidth={1.75} />,
      onClick: () => navigate(`/extra-costs/${order.id}`),
    };
  }
  return null;
}

const RescuePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    orders,
    updateOrder,
    driverRole,
    readyForRescue,
    setReadyForRescue,
    currentDriverId,
  } = useApp();
  const [ratingOpen, setRatingOpen] = React.useState(false);

  if (driverRole === 'quote-only') {
    return <Navigate to="/quotes" replace />;
  }

  const activeJob = getRescueTabActiveJob(orders, driverRole, currentDriverId);
  const pendingCount = orders.filter((o) => o.status === 'cho-nhan').length;

  if (!activeJob) {
    const emptyCopy = getRescueEmptyCopy(driverRole, readyForRescue, pendingCount);
    const isNotReady = emptyCopy.state === 'not-ready';

    const handleEmptyCta = () => {
      if (emptyCopy.action === 'go-online') {
        setReadyForRescue(true);
        return;
      }
      navigate('/activity');
    };

    return (
      <MainShell>
        <div className={`rescue-empty rescue-empty--${emptyCopy.state}`}>
          <div className="rescue-empty__map">
            <RescueMap />
            {!isNotReady && (
              <div className="rescue-empty__ready-pill" role="status">
                <span className="rescue-empty__ready-pill-dot" aria-hidden />
                Sẵn sàng nhận đơn
              </div>
            )}
          </div>

          <div className="rescue-empty__sheet">
            <div
              className={`rescue-empty__icon-wrap rescue-empty__icon-wrap--${emptyCopy.state}`}
            >
              {isNotReady ? (
                <Moon size={28} strokeWidth={1.75} />
              ) : (
                <Siren size={28} strokeWidth={1.75} />
              )}
            </div>
            <h2>{emptyCopy.title}</h2>
            <p>{emptyCopy.description}</p>

            <button
              type="button"
              className={
                isNotReady
                  ? 'grab-online-btn rescue-empty__go-online'
                  : 'grab-btn-accept rescue-empty__cta'
              }
              onClick={handleEmptyCta}
            >
              {emptyCopy.cta}
            </button>
          </div>
        </div>
      </MainShell>
    );
  }

  const stage = activeJob.jobStage ?? 'da-nhan';
  const action = STAGE_ACTIONS[stage];
  const secondaryAction = getSecondaryAction(stage, activeJob, navigate);
  const customerPhone = getCustomerPhone(activeJob);
  const hasTow = Boolean(activeJob.towDestination);

  const advanceStage = () => {
    if (!action.next) return;
    if (action.next === 'hoan-thanh') {
      updateOrder(activeJob.id, { jobStage: 'hoan-thanh', status: 'hoan-thanh' });
      setRatingOpen(true);
      return;
    }
    updateOrder(activeJob.id, { jobStage: action.next });
  };

  const handleRating = () => {
    setRatingOpen(false);
  };

  const etaLabel =
    activeJob.etaMinutes != null && activeJob.distanceKm != null
      ? `${activeJob.etaMinutes} phút · ${activeJob.distanceKm} km`
      : activeJob.etaTime
        ? `ETA ${activeJob.etaTime}`
        : null;

  return (
    <MainShell>
      <div className="rescue-live">
        <div className="rescue-live__map">
          <RescueMap order={activeJob} />

          <a
            className="rescue-live__cskh-btn"
            href={`tel:${MOCK_CSKH_PHONE}`}
            aria-label="Gọi CSKH"
          >
            <Headset size={18} strokeWidth={2} />
          </a>

          <div className="rescue-map-tools rescue-map-tools--bottom">
            {etaLabel && (
              <div className="rescue-live__route-pill">
                <Navigation size={14} />
                {etaLabel}
              </div>
            )}
            <button
              type="button"
              className="rescue-live__nav-fab"
              onClick={() => navigate(`/jobs/${activeJob.id}/map`)}
            >
              <Navigation size={18} />
              Chỉ đường
            </button>
          </div>
        </div>

        <div className="rescue-sheet">
          <div className="rescue-sheet__head">
            <div className="rescue-sheet__identity">
              <DlsStatusBadge label="Đang cứu hộ" variant="success" showDot={false} />
              <h2 className="rescue-sheet__plate">{formatPlateDisplay(activeJob.plate)}</h2>
              <p className="rescue-sheet__vehicle">
                {activeJob.brand} {activeJob.model}
                {activeJob.condition ? ` · ${activeJob.condition}` : ''}
              </p>
            </div>
            <div className="rescue-sheet__head-aside">
              <DlsStatusBadge
                label={getStageChipLabel(stage, hasTow)}
                variant={getStageChipVariant(stage)}
                showDot={false}
              />
              <a
                className="rescue-sheet__call-btn"
                href={`tel:${customerPhone}`}
                aria-label="Gọi khách hàng"
              >
                <Phone size={20} strokeWidth={2} />
              </a>
            </div>
          </div>

          <ul className="rescue-sheet__stops">
            <li className="rescue-sheet__stop">
              <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--pickup" aria-hidden>
                <MapPin size={15} strokeWidth={2.25} />
              </span>
              <div className="rescue-sheet__stop-body">
                <span className="rescue-sheet__stop-label">Điểm cứu hộ</span>
                <AddressMapLink
                  address={activeJob.address}
                  coords={activeJob.pickupCoords}
                />
              </div>
            </li>
            {activeJob.towDestination && (
              <li className="rescue-sheet__stop">
                <span className="rescue-sheet__stop-icon rescue-sheet__stop-icon--tow" aria-hidden>
                  <Flag size={14} strokeWidth={2.25} />
                </span>
                <div className="rescue-sheet__stop-body">
                  <span className="rescue-sheet__stop-label">Điểm kéo xe về</span>
                  <AddressMapLink
                    address={activeJob.towDestination}
                    coords={activeJob.towCoords}
                  />
                </div>
              </li>
            )}
          </ul>

          <div className="rescue-sheet__actions-row">
            <button
              type="button"
              className="rescue-sheet__action-btn rescue-sheet__action-btn--icon"
              onClick={() => navigate(`/orders/${activeJob.id}`)}
              aria-label="Chi tiết đơn"
            >
              <FileText size={20} strokeWidth={1.75} />
            </button>
            {secondaryAction && (
              <button
                type="button"
                className="rescue-sheet__action-btn rescue-sheet__action-btn--icon"
                onClick={secondaryAction.onClick}
                aria-label={secondaryAction.label}
              >
                {secondaryAction.icon}
              </button>
            )}
            {stage !== 'hoan-thanh' && (
              <button
                type="button"
                className="grab-btn-accept rescue-sheet__action-btn--primary"
                onClick={advanceStage}
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>

      <RatingSheet open={ratingOpen} onClose={handleRating} onSubmit={handleRating} />
    </MainShell>
  );
};

export default RescuePage;
