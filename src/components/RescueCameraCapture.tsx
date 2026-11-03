import React from 'react';
import { Check, Image as ImageIcon, RefreshCw, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatStampLabels,
  getGeoPosition,
  PhotoStampMeta,
  stampCanvas,
} from '../utils/rescuePhotoStamp';

interface FrozenFrame {
  shotId: RescueShotId;
  frame: HTMLCanvasElement;
  capturedAt: Date;
}
import { getOrderPickup } from '../utils/orderMap';
import VehicleCaptureOverlay from './VehicleCaptureOverlay';
import { CaptureOverlayKind, RescueOrder, RescueShotId } from '../types';

export interface CaptureGuide {
  code: string;
  title: string;
  hint: string;
  overlay: CaptureOverlayKind;
  step?: number;
  progress?: string;
  optional?: boolean;
}

export type ReserveOutcome = { close: boolean; guide: CaptureGuide | null } | null;

interface RescueCameraCaptureProps {
  open: boolean;
  order: RescueOrder;
  guide?: CaptureGuide;
  onSkip?: () => void;
  onClose: () => void;
  /** Giữ chỗ và chuyển mã ngay. close: đóng sau khi xử lý xong. null: đã đủ ảnh. */
  onReserve: (shotId: RescueShotId) => ReserveOutcome;
  /** Ảnh đã đóng dấu, gắn vào đúng mã đã giữ chỗ. */
  onCommit: (shotId: RescueShotId, dataUrl: string) => void;
  /** Bỏ chỗ đã giữ khi không xử lý được khung hình. */
  onDrop: (shotId: RescueShotId) => void;
}

const RescueCameraCapture: React.FC<RescueCameraCaptureProps> = ({
  open,
  order,
  guide,
  onSkip,
  onClose,
  onReserve,
  onCommit,
  onDrop,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [ready, setReady] = React.useState(false);
  const [facing, setFacing] = React.useState<'environment' | 'user'>('environment');
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [queueSize, setQueueSize] = React.useState(0);
  const [savedFlash, setSavedFlash] = React.useState(false);
  const { currentDriverName } = useApp();
  const [now, setNow] = React.useState(() => new Date());
  const [position, setPosition] = React.useState(() => getOrderPickup(order));
  const positionRef = React.useRef(position);
  positionRef.current = position;
  const queueRef = React.useRef<FrozenFrame[]>([]);
  const pendingRef = React.useRef(0);
  const drainingRef = React.useRef(false);
  const closeAfterQueueRef = React.useRef(false);
  const guideRef = React.useRef(guide);
  const [shownGuide, setShownGuide] = React.useState(guide);
  guideRef.current = shownGuide ?? guide;

  React.useEffect(() => {
    if (!guide) return;
    guideRef.current = guide;
    setShownGuide(guide);
  }, [guide?.code, guide?.step, guide?.progress, guide?.hint, guide?.title]);

  React.useEffect(() => {
    if (!open) return undefined;
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    getGeoPosition(getOrderPickup(order)).then(setPosition);
    return () => window.clearInterval(timer);
  }, [open, order]);

  React.useEffect(() => {
    if (!open) {
      setReady(false);
      setError(null);
      setSavedFlash(false);
      return undefined;
    }

    let cancelled = false;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
          setReady(true);
        }
      } catch {
        if (!cancelled) {
          setError('Không mở được camera. Kiểm tra quyền truy cập camera trên thiết bị.');
        }
      }
    };

    void start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [open, facing]);

  const stampMeta: PhotoStampMeta = {
    capturedAt: now,
    lat: position.lat,
    lng: position.lng,
    address: order.address,
    photographer: currentDriverName,
  };
  const labels = formatStampLabels(stampMeta);

  const drainQueue = React.useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;
    try {
      while (queueRef.current.length > 0) {
        const job = queueRef.current.shift()!;
        try {
          const geo = positionRef.current;
          const dataUrl = await stampCanvas(job.frame, job.frame.width, job.frame.height, {
            capturedAt: job.capturedAt,
            lat: geo.lat,
            lng: geo.lng,
            address: order.address,
            photographer: currentDriverName,
          });
          onCommit(job.shotId, dataUrl);
        } catch {
          onDrop(job.shotId);
        } finally {
          pendingRef.current = Math.max(0, pendingRef.current - 1);
          setQueueSize(pendingRef.current);
        }
      }
    } finally {
      drainingRef.current = false;
      if (queueRef.current.length > 0) {
        void drainQueue();
        return;
      }
      if (closeAfterQueueRef.current) {
        closeAfterQueueRef.current = false;
        onClose();
      }
    }
  }, [currentDriverName, onClose, onCommit, onDrop, order.address]);

  const enqueueFrame = (shotId: RescueShotId, frame: HTMLCanvasElement) => {
    const outcome = onReserve(shotId);
    if (!outcome) return;
    queueRef.current.push({ shotId, frame, capturedAt: new Date() });
    pendingRef.current += 1;
    setQueueSize(pendingRef.current);
    if (outcome.guide) {
      guideRef.current = outcome.guide;
      setShownGuide(outcome.guide);
    }
    if (outcome.close) closeAfterQueueRef.current = true;
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 700);
    void drainQueue();
  };

  const handleCapture = () => {
    const video = videoRef.current;
    const shotId = guideRef.current?.code as RescueShotId | undefined;
    if (!video || !ready || !shotId || !video.videoWidth) return;
    const frame = document.createElement('canvas');
    frame.width = video.videoWidth;
    frame.height = video.videoHeight;
    const ctx = frame.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, frame.width, frame.height);
    enqueueFrame(shotId, frame);
  };

  const handleLibrary = (file: File | null) => {
    const shotId = guideRef.current?.code as RescueShotId | undefined;
    if (!file || !shotId) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const frame = document.createElement('canvas');
      frame.width = img.naturalWidth || img.width;
      frame.height = img.naturalHeight || img.height;
      const ctx = frame.getContext('2d');
      URL.revokeObjectURL(url);
      if (!ctx || !frame.width) return;
      ctx.drawImage(img, 0, 0);
      enqueueFrame(shotId, frame);
    };
    img.src = url;
  };

  const requestClose = () => {
    if (pendingRef.current > 0 || drainingRef.current) {
      closeAfterQueueRef.current = true;
      return;
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="rescue-camera-live" role="dialog" aria-modal aria-label="Chụp ảnh cứu hộ">
      <video
        ref={videoRef}
        className="rescue-camera-live__video"
        playsInline
        muted
        aria-hidden
      />

      <div className="rescue-camera-live__shade" aria-hidden />

      <div className="rescue-camera-live__top">
        <button
          type="button"
          className="rescue-camera-live__close"
          onClick={requestClose}
          aria-label="Đóng camera"
        >
          <X size={22} strokeWidth={2} />
        </button>
        <h2 className="rescue-camera-live__heading">{shownGuide?.title ?? 'Chụp ảnh'}</h2>
        {shownGuide?.progress ? (
          <span className="rescue-camera-live__count">{shownGuide.progress}</span>
        ) : (
          <span className="rescue-camera-live__count rescue-camera-live__count--empty" />
        )}
      </div>
      {shownGuide?.hint && <p className="rescue-camera-live__hint">{shownGuide.hint}</p>}

      {shownGuide && (
        <div className="rescue-camera-live__guide">
          <VehicleCaptureOverlay kind={shownGuide.overlay} step={shownGuide.step} />
        </div>
      )}

      <div className="rescue-camera-live__stamp" aria-live="polite">
        <div className="rescue-camera-live__clock">
          <span className="rescue-camera-live__time">{labels.time}</span>
          <span className="rescue-camera-live__seconds">{labels.seconds}</span>
          <span className="rescue-camera-live__bar" aria-hidden="true" />
          <span className="rescue-camera-live__date">{labels.date}</span>
        </div>
        <p className="rescue-camera-live__line">{labels.address}</p>
        <p className="rescue-camera-live__line">{labels.coords}</p>
        <p className="rescue-camera-live__line">{labels.photographer}</p>
      </div>

      {savedFlash && (
        <div className="rescue-camera-live__saved" role="status">
          <Check size={18} strokeWidth={2.5} />
          Đã chụp — chụp tiếp
        </div>
      )}

      {error ? (
        <div className="rescue-camera-live__error">
          <p>{error}</p>
          <button type="button" className="rescue-camera-live__error-btn" onClick={onClose}>
            Đóng
          </button>
        </div>
      ) : (
        <>
          {queueSize > 0 && (
            <p className="rescue-camera-live__queue" role="status">
              Đang xử lý {queueSize} ảnh
            </p>
          )}
          <div className="rescue-camera-live__dock">
            <div className="rescue-camera-live__dock-side">
              <button
                type="button"
                className="rescue-camera-live__tool"
                onClick={() => setFacing((current) => (current === 'environment' ? 'user' : 'environment'))}
              >
                <span className="rescue-camera-live__tool-icon">
                  <RefreshCw size={20} strokeWidth={1.75} />
                </span>
                Lật camera
              </button>
            </div>
            <button
              type="button"
              className="rescue-camera-live__shutter"
              onClick={() => void handleCapture()}
              disabled={!ready}
              aria-label="Chụp ảnh"
            />
            <div className="rescue-camera-live__dock-side">
              {onSkip ? (
                <button type="button" className="rescue-camera-live__tool" onClick={onSkip}>
                  <span className="rescue-camera-live__tool-icon">Bỏ</span>
                  Bỏ qua
                </button>
              ) : (
                <button
                  type="button"
                  className="rescue-camera-live__tool"
                  onClick={() => fileRef.current?.click()}
                >
                  <span className="rescue-camera-live__tool-icon">
                    <ImageIcon size={20} strokeWidth={1.75} />
                  </span>
                  Thư viện
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="rescue-camera-live__file"
            onChange={(event) => {
              handleLibrary(event.target.files?.[0] ?? null);
              event.target.value = '';
            }}
          />
        </>
      )}
    </div>
  );
};

export default RescueCameraCapture;
