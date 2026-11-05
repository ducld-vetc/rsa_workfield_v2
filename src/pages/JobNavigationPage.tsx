import React from 'react';
import { Camera, MapPin, Navigation, Phone, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import RatingSheet from '../components/RatingSheet';
import { AcceptOdoSheet, CompleteRescueSheet, CompleteRescueInput } from '../components/RescueOdoSheet';
import AddressMapLink from '../components/AddressMapLink';
import { useApp } from '../context/AppContext';
import { DlsHomeIndicator } from '@dls/components';
import { JOB_STAGE_LABELS } from '../types';
import {
  getStageAction,
  isProcessSetComplete,
  markPendingRating,
  rescueCameraPath,
  suggestedPhotoSet,
} from '../utils/rescueStage';

const JobNavigationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, updateOrder } = useApp();
  const order = getOrder(id ?? '');
  const [ratingOpen, setRatingOpen] = React.useState(false);
  const [completeOpen, setCompleteOpen] = React.useState(false);
  const [startOdoOpen, setStartOdoOpen] = React.useState(false);

  if (!order) {
    return (
      <div className="dm-screen">
        <p className="dm-empty">Không tìm thấy đơn.</p>
      </div>
    );
  }

  const stage = order.jobStage ?? 'da-nhan';
  const hasTow = Boolean(order.towDestination);
  const action = getStageAction(stage, hasTow, isProcessSetComplete(order));
  const isPickup = stage === 'da-nhan' || stage === 'dang-di-chuyen';
  const isDropoff = stage === 'dang-keo' || stage === 'da-keo-toi';

  const advanceStage = () => {
    if (action.needsStartOdo) {
      setStartOdoOpen(true);
      return;
    }
    if (action.captureOnly && action.photoSet) {
      navigate(rescueCameraPath(order.id, action.photoSet, true));
      return;
    }
    if (action.needsCompleteSheet) {
      setCompleteOpen(true);
      return;
    }
    if (!action.next) return;
    updateOrder(order.id, { jobStage: action.next });
    if (action.photoSet) navigate(rescueCameraPath(order.id, action.photoSet, true));
  };

  const confirmStartMove = (odoKm: string) => {
    updateOrder(order.id, { startOdoKm: odoKm, jobStage: 'dang-di-chuyen' });
    setStartOdoOpen(false);
  };

  const confirmComplete = (input: CompleteRescueInput) => {
    updateOrder(order.id, {
      jobStage: 'hoan-thanh',
      status: 'hoan-thanh',
      endOdoKm: input.endOdoKm,
      returnToWorkshop: input.returnToWorkshop,
      workshopName: input.workshopName,
    });
    setCompleteOpen(false);
    markPendingRating();
    navigate(rescueCameraPath(order.id, 'C', true));
  };

  const handleRating = () => {
    setRatingOpen(false);
    navigate('/home');
  };

  return (
    <div className="grab-job dm-screen">
      <div className="grab-job__map">
        <div className="grab-map__roads" />
        <button type="button" className="grab-job__back" onClick={() => navigate('/home')} aria-label="Quay lại">
          ←
        </button>
        <div className="rescue-map-tools rescue-map-tools--bottom">
          {order.etaTime && (
            <div className="grab-job__eta">
              ETA {order.etaTime} · {order.distanceKm ?? '—'} km
            </div>
          )}
          <button
            type="button"
            className="grab-job__nav-fab"
            onClick={() => navigate(`/jobs/${order.id}/map`)}
          >
            <Navigation size={20} />
            Chỉ đường
          </button>
        </div>
      </div>

      <div className="grab-job-sheet">
        <div className="grab-offer__handle" />

        <div className="grab-job-sheet__stage">
          <span className={`grab-job-sheet__stage-dot ${isPickup ? 'grab-job-sheet__stage-dot--pickup' : isDropoff ? 'grab-job-sheet__stage-dot--dropoff' : ''}`} />
          <div>
            <p className="grab-job-sheet__stage-label">{JOB_STAGE_LABELS[stage]}</p>
            <p className="grab-job-sheet__plate">{order.plate} · {order.brand}</p>
          </div>
        </div>

        <div className="grab-route grab-route--compact">
          <div className="grab-route__row">
            <span className="grab-route__dot grab-route__dot--pickup" />
            <div className="grab-route__text">
              <AddressMapLink address={order.address} coords={order.pickupCoords} />
            </div>
          </div>
          {order.towDestination && (
            <>
              <div className="grab-route__connector" />
              <div className="grab-route__row">
                <span className="grab-route__dot grab-route__dot--dropoff" />
                <div className="grab-route__text">
                  <AddressMapLink
                    address={order.towDestination}
                    coords={order.towCoords}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="grab-job-actions">
          <button
            type="button"
            className="grab-job-action"
            onClick={() => navigate(rescueCameraPath(order.id, suggestedPhotoSet(stage)))}
          >
            <Camera size={20} />
            <span>Ảnh</span>
          </button>
          <button type="button" className="grab-job-action" onClick={() => navigate(`/extra-costs/${order.id}`)}>
            <Plus size={20} />
            <span>Phí PS</span>
          </button>
          <button type="button" className="grab-job-action">
            <Phone size={20} />
            <span>Gọi</span>
          </button>
          <button type="button" className="grab-job-action" onClick={() => navigate(`/orders/${order.id}`)}>
            <MapPin size={20} />
            <span>Chi tiết</span>
          </button>
        </div>

        {stage !== 'hoan-thanh' && (
          <button type="button" className="grab-btn-accept grab-btn-accept--job" onClick={advanceStage}>
            {action.label}
          </button>
        )}
      </div>

      <AcceptOdoSheet
        open={startOdoOpen}
        initialOdo={order.startOdoKm}
        onClose={() => setStartOdoOpen(false)}
        onConfirm={confirmStartMove}
      />
      <CompleteRescueSheet
        open={completeOpen}
        onClose={() => setCompleteOpen(false)}
        onConfirm={confirmComplete}
      />
      <RatingSheet open={ratingOpen} onClose={handleRating} onSubmit={handleRating} />
      <DlsHomeIndicator />
    </div>
  );
};

export default JobNavigationPage;
