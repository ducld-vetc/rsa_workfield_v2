import React from 'react';
import { Check, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatStampLabels,
  getGeoPosition,
  PhotoStampMeta,
  stampVideoFrame,
} from '../utils/rescuePhotoStamp';
import { getOrderPickup } from '../utils/orderMap';
import { RescueOrder } from '../types';

interface RescueCameraCaptureProps {
  open: boolean;
  order: RescueOrder;
  onClose: () => void;
  /** Trả về true nếu nên đóng camera (vd. đã đủ ảnh loại này). */
  onCapture: (dataUrl: string) => boolean;
}

const RescueCameraCapture: React.FC<RescueCameraCaptureProps> = ({
  open,
  order,
  onClose,
  onCapture,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [capturing, setCapturing] = React.useState(false);
  const [savedFlash, setSavedFlash] = React.useState(false);
  const { currentDriverName } = useApp();
  const [now, setNow] = React.useState(() => new Date());
  const [position, setPosition] = React.useState(() => getOrderPickup(order));

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
          video: { facingMode: { ideal: 'environment' } },
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
  }, [open]);

  const stampMeta: PhotoStampMeta = {
    capturedAt: now,
    lat: position.lat,
    lng: position.lng,
    address: order.address,
    photographer: currentDriverName,
  };
  const labels = formatStampLabels(stampMeta);

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !ready || capturing) return;
    setCapturing(true);
    try {
      const capturedAt = new Date();
      const geo = await getGeoPosition(position);
      const dataUrl = await stampVideoFrame(video, {
        capturedAt,
        lat: geo.lat,
        lng: geo.lng,
        address: order.address,
        photographer: currentDriverName,
      });
      const shouldClose = onCapture(dataUrl);
      if (shouldClose) {
        onClose();
      } else {
        setSavedFlash(true);
        window.setTimeout(() => setSavedFlash(false), 700);
      }
    } catch {
      setError('Không chụp được ảnh. Thử lại.');
    } finally {
      setCapturing(false);
    }
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

      <button
        type="button"
        className="rescue-camera-live__close"
        onClick={onClose}
        aria-label="Đóng camera"
      >
        <X size={22} strokeWidth={2} />
      </button>

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
          Đã lưu — chụp tiếp
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
        <button
          type="button"
          className="rescue-camera-live__shutter"
          onClick={() => void handleCapture()}
          disabled={!ready || capturing}
          aria-label="Chụp ảnh"
        />
      )}
    </div>
  );
};

export default RescueCameraCapture;
