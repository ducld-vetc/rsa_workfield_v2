import React from 'react';
import { Camera, Check, Info, X } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import RescueCameraCapture, { CaptureGuide, ReserveOutcome } from '../components/RescueCameraCapture';
import { useApp } from '../context/AppContext';
import {
  RESCUE_SET_META,
  ShotDraft,
  continuesUntilFull,
  emptyShotDraft,
  findShot,
  firstOpenShot,
  overlayStep,
  photoSetFromQuery,
  photosOfSet,
  requiredCount,
  shotAfterCapture,
  shotDraftFromOrder,
  shotHint,
  shotsForSet,
  syncCategoryPhotos,
} from '../data/rescueShots';
import { DlsHomeIndicator, DlsTopNav } from '@dls/components';
import { RescueOrder, RescuePhotoSet, RescueShotId } from '../types';
import { suggestedPhotoSet } from '../utils/rescueStage';

function addShotPhoto(prev: ShotDraft, shotId: RescueShotId, dataUrl: string): ShotDraft {
  const shot = findShot(shotId);
  const current = prev[shotId] ?? [];
  if (current.length >= shot.max) return prev;
  return { ...prev, [shotId]: [...current, dataUrl].slice(0, shot.max) };
}

const CameraPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getOrder, updateOrder, poorConnection, enqueueSync, noteBuffered } = useApp();
  const order = getOrder(id ?? '');

  const requestedSet = photoSetFromQuery(searchParams.get('set'), searchParams.get('type'));
  const captureRequested = searchParams.get('capture') === '1';
  const [activeSet, setActiveSet] = React.useState<RescuePhotoSet>(requestedSet ?? 'A');
  const [draft, setDraft] = React.useState<ShotDraft>(emptyShotDraft);
  const [captureId, setCaptureId] = React.useState<RescueShotId | null>(null);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [sequence, setSequence] = React.useState(false);
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState<string[]>([]);
  const [reserved, setReserved] = React.useState<Partial<Record<RescueShotId, number>>>({});
  const sequenceStarted = React.useRef(false);
  const draftRef = React.useRef(draft);
  const reservedRef = React.useRef(reserved);
  draftRef.current = draft;
  reservedRef.current = reserved;

  const takenOf = React.useCallback(
    (shotId: RescueShotId) =>
      (draftRef.current[shotId]?.length ?? 0) + (reservedRef.current[shotId] ?? 0),
    [],
  );

  const hasTow = Boolean(order?.towDestination);

  const persist = React.useCallback(
    (next: ShotDraft) => {
      if (!order) return;
      const previous = shotDraftFromOrder(order.rescueShotPhotos);
      const updates: Partial<RescueOrder> = {
        rescueShotPhotos: next,
        incidentPhotos: syncCategoryPhotos(
          order.incidentPhotos,
          photosOfSet(previous, 'A'),
          photosOfSet(next, 'A'),
        ),
        processPhotos: syncCategoryPhotos(
          order.processPhotos,
          photosOfSet(previous, 'B'),
          photosOfSet(next, 'B'),
        ),
        completionPhotos: syncCategoryPhotos(
          order.completionPhotos,
          photosOfSet(previous, 'C'),
          photosOfSet(next, 'C'),
        ),
      };
      updateOrder(order.id, updates);
      if (poorConnection) noteBuffered();
    },
    [noteBuffered, order, poorConnection, updateOrder],
  );

  const leaveSequence = React.useCallback(
    (next: ShotDraft) => {
      persist(next);
      setSequence(false);
      setCameraOpen(false);
      setCaptureId(null);
      navigate('/home', { replace: true });
    },
    [navigate, persist],
  );

  React.useEffect(() => {
    if (!order || sequenceStarted.current) return;
    const loaded = shotDraftFromOrder(order.rescueShotPhotos);
    setDraft(loaded);
    const setId = requestedSet ?? suggestedPhotoSet(order.jobStage ?? 'da-nhan');
    if (!requestedSet) setActiveSet(setId);
    if (!captureRequested) return;
    sequenceStarted.current = true;
    const shots = shotsForSet(setId, Boolean(order.towDestination));
    const first = firstOpenShot(shots, (shotId) => loaded[shotId]?.length ?? 0);
    if (!first) {
      navigate('/home', { replace: true });
      return;
    }
    setActiveSet(setId);
    setSequence(true);
    setCaptureId(first.id);
    setCameraOpen(true);
  }, [order?.id]);

  const visibleShots = shotsForSet(activeSet, hasTow);
  const setMeta = RESCUE_SET_META.find((item) => item.id === activeSet)!;

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/home');
  };

  const openSingle = (shotId: RescueShotId) => {
    setSequence(false);
    setCaptureId(shotId);
    setCameraOpen(true);
  };

  const releaseReserved = (shotId: RescueShotId) => {
    const next = { ...reservedRef.current };
    const left = (next[shotId] ?? 1) - 1;
    if (left > 0) next[shotId] = left;
    else delete next[shotId];
    reservedRef.current = next;
    setReserved(next);
  };

  const buildGuide = (shotId: RescueShotId): CaptureGuide => {
    const shot = findShot(shotId);
    const count = takenOf(shotId);
    const index = shotsForSet(activeSet, hasTow).findIndex((item) => item.id === shotId);
    return {
      code: shot.id,
      title: shot.label,
      hint: shotHint(shot, count),
      overlay: shot.overlay,
      step: overlayStep(shot.overlay, count),
      progress: sequence && index >= 0 ? `${index + 1}/${shotsForSet(activeSet, hasTow).length}` : undefined,
      optional: shot.optional,
    };
  };

  const handleReserve = (shotId: RescueShotId): ReserveOutcome => {
    const shot = findShot(shotId);
    if (takenOf(shotId) >= shot.max) return null;
    const nextReserved = {
      ...reservedRef.current,
      [shotId]: (reservedRef.current[shotId] ?? 0) + 1,
    };
    reservedRef.current = nextReserved;
    setReserved(nextReserved);
    const shots = shotsForSet(activeSet, hasTow);
    if (sequence) {
      const nextId = shotAfterCapture(shots, takenOf, shotId);
      if (!nextId) return { close: true, guide: null };
      setCaptureId(nextId);
      return { close: false, guide: buildGuide(nextId) };
    }
    const stay = continuesUntilFull(shot) && takenOf(shotId) < shot.max;
    if (!stay) return { close: true, guide: null };
    return { close: false, guide: buildGuide(shotId) };
  };

  const handleCommit = (shotId: RescueShotId, dataUrl: string) => {
    releaseReserved(shotId);
    const nextDraft = addShotPhoto(draftRef.current, shotId, dataUrl);
    draftRef.current = nextDraft;
    setDraft(nextDraft);
    persist(nextDraft);
    setUploading((prev) => [...prev, dataUrl]);
    if (poorConnection) {
      enqueueSync({ kind: 'photo', orderId: id ?? '', label: `Ảnh ${shotId}` });
    } else {
      window.setTimeout(() => {
        setUploading((prev) => prev.filter((item) => item !== dataUrl));
      }, 1400);
    }
  };

  const handleDrop = (shotId: RescueShotId) => {
    releaseReserved(shotId);
  };

  React.useEffect(() => {
    if (!poorConnection) setUploading([]);
  }, [poorConnection]);

  const handleSkip = () => {
    if (!captureId || !sequence) return;
    const shots = shotsForSet(activeSet, hasTow);
    const nextId = shotAfterCapture(shots, takenOf, captureId, true);
    if (!nextId) {
      leaveSequence(draftRef.current);
      return;
    }
    setCaptureId(nextId);
  };

  const handleCloseCamera = () => {
    if (sequence) {
      leaveSequence(draftRef.current);
      return;
    }
    setCameraOpen(false);
    setCaptureId(null);
  };

  const removeLastPhoto = (shotId: RescueShotId) => {
    const next = {
      ...draftRef.current,
      [shotId]: (draftRef.current[shotId] ?? []).slice(0, -1),
    };
    draftRef.current = next;
    setDraft(next);
    persist(next);
  };

  const captureShot = captureId ? findShot(captureId) : null;
  const captureCount = captureId ? takenOf(captureId) : 0;
  const sequenceIndex = captureShot
    ? visibleShots.findIndex((shot) => shot.id === captureShot.id)
    : -1;

  if (!order) {
    return (
      <div className="dm-screen">
        <DlsTopNav title="Ảnh cứu hộ" onBack={goBack} />
        <p className="dm-empty">Không tìm thấy đơn.</p>
        <DlsHomeIndicator />
      </div>
    );
  }

  const setIndex = Math.max(0, RESCUE_SET_META.findIndex((item) => item.id === activeSet));
  const requiredShots = visibleShots.filter((shot) => requiredCount(shot) > 0);
  const requiredTotal = requiredShots.reduce((sum, shot) => sum + requiredCount(shot), 0);
  const requiredDone = requiredShots.reduce(
    (sum, shot) => sum + Math.min(draft[shot.id]?.length ?? 0, requiredCount(shot)),
    0,
  );
  const progressPct = requiredTotal === 0 ? 0 : Math.round((requiredDone / requiredTotal) * 100);
  const setLead = !hasTow && setMeta.leadOnSite ? setMeta.leadOnSite : setMeta.lead;

  return (
    <div className="dm-screen rescue-capture">
      <DlsTopNav
        title="Chụp ảnh cứu hộ"
        onBack={goBack}
        actions={
          <button
            type="button"
            className="rescue-capture__info-btn"
            aria-label="Giải thích bộ ảnh"
            aria-expanded={infoOpen}
            onClick={() => setInfoOpen((open) => !open)}
          >
            <Info size={20} strokeWidth={2} />
          </button>
        }
      />

      <div className="rescue-capture__body">
        {poorConnection && (
          <p className="rescue-camera__pending" role="status">
            Ảnh chờ gửi khi kết nối ổn định.
          </p>
        )}
        {infoOpen && <p className="rescue-capture__info">{setLead}</p>}

        <div className="rescue-capture__step-row">
          <div className="rescue-capture__sets" role="tablist" aria-label="Bộ ảnh">
            {RESCUE_SET_META.map((meta) => {
              const on = meta.id === activeSet;
              return (
                <button
                  key={meta.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  className={`rescue-capture__set${on ? ' rescue-capture__set--on' : ''}`}
                  onClick={() => setActiveSet(meta.id)}
                >
                  {meta.tab}
                </button>
              );
            })}
          </div>
          <span className="rescue-capture__step">Bước {setIndex + 1} / {RESCUE_SET_META.length}</span>
        </div>

        <section className="rescue-capture__progress" aria-label="Tiến độ chụp ảnh">
          <div className="rescue-capture__progress-head">
            <span>Tiến độ chụp ảnh</span>
            <strong>
              {requiredDone} / {requiredTotal} ảnh
            </strong>
          </div>
          <div className="rescue-capture__bar" aria-hidden>
            <span style={{ width: `${progressPct}%` }} />
          </div>
          <p>Vui lòng chụp đầy đủ các ảnh bắt buộc</p>
        </section>

        <div className="rescue-capture__section-head">
          <h2>Danh sách ảnh cần chụp</h2>
          <span>* Bắt buộc</span>
        </div>

        <ul className="rescue-capture__grid">
          {visibleShots.map((shot) => {
            const photos = draft[shot.id] ?? [];
            const cover = photos[photos.length - 1];
            const full = photos.length >= shot.max;
            const showCheck = photos.length > 0 && photos.length >= requiredCount(shot);
            const pending = Boolean(cover && uploading.includes(cover));
            const openCard = () => {
              if (showCheck && full && cover) setPreview(cover);
              else openSingle(shot.id);
            };
            const status = showCheck && full
                ? 'Đã có ảnh · Chạm để xem'
                : photos.length > 0
                  ? `${photos.length}/${shot.max} ảnh · Chạm để chụp tiếp`
                  : shot.optional
                    ? 'Không bắt buộc · Chạm để chụp'
                    : 'Chạm để mở camera';
            return (
              <li
                key={shot.id}
                id={`shot-${shot.id}`}
                className="rescue-capture-card"
              >
                <button type="button" className="rescue-capture-card__hit" onClick={openCard}>
                  <span className="rescue-capture-card__media">
                    {cover ? (
                      <img src={cover} alt="" />
                    ) : (
                      <span className="rescue-capture-card__empty">
                        <Camera size={22} strokeWidth={1.75} />
                      </span>
                    )}
                    {showCheck && !pending && (
                      <span className="rescue-capture-card__badge" aria-label="Đã chụp">
                        <Check size={14} strokeWidth={2.75} />
                      </span>
                    )}
                    {!cover && (
                      <span className={`rescue-capture-card__need${shot.optional ? ' rescue-capture-card__need--optional' : ''}`}>
                        {shot.optional ? 'Tuỳ chọn' : 'Cần chụp'}
                      </span>
                    )}
                    {pending && (
                      <span className="rescue-capture-card__loading" role="status" aria-label="Đang tải lên">
                        <span className="rescue-capture-card__spin" />
                      </span>
                    )}
                  </span>
                  <span className="rescue-capture-card__title">
                    <span className="rescue-capture-card__code">{shot.id}</span>
                    {shot.label}
                  </span>
                  <span className={`rescue-capture-card__status${showCheck && full ? ' rescue-capture-card__status--done' : ''}`}>
                    {status}
                  </span>
                </button>
                {photos.length > 0 && (
                  <button
                    type="button"
                    className="rescue-capture-card__remove"
                    aria-label={`Xoá ảnh ${shot.id}`}
                    onClick={() => removeLastPhoto(shot.id)}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                )}
              </li>
            );
          })}
        </ul>

      </div>

      {captureShot && (
        <RescueCameraCapture
          open={cameraOpen}
          order={order}
          guide={{
            code: captureShot.id,
            title: captureShot.label,
            hint: shotHint(captureShot, captureCount),
            overlay: captureShot.overlay,
            step: overlayStep(captureShot.overlay, captureCount),
            progress: sequenceIndex >= 0 ? `${sequenceIndex + 1}/${visibleShots.length}` : undefined,
            optional: captureShot.optional,
          }}
          onSkip={sequence && captureShot.optional ? handleSkip : undefined}
          onClose={handleCloseCamera}
          onReserve={handleReserve}
          onCommit={handleCommit}
          onDrop={handleDrop}
        />
      )}

      {preview && (
        <div className="rescue-capture-preview" role="dialog" aria-modal aria-label="Xem ảnh">
          <button type="button" className="rescue-capture-preview__close" onClick={() => setPreview(null)} aria-label="Đóng">
            <X size={20} strokeWidth={2} />
          </button>
          <img src={preview} alt="" />
        </div>
      )}

      <DlsHomeIndicator />
    </div>
  );
};

export default CameraPage;
