import React from 'react';
import { ImagePlus, X } from 'lucide-react';
import { GeoPoint } from '../types';
import { EMPTY_MAP_CENTER } from '../utils/orderMap';
import {
  FieldPhotoStampMeta,
  getGeoPosition,
  stampFieldImageFile,
  stampFieldVideoFrame,
} from '../utils/rescuePhotoStamp';

interface FieldPhotoCaptureProps {
  photographer: string;
  sceneAddress: string;
  scenePoint: GeoPoint | null;
  onClose: () => void;
  /** Trả về true khi đã đủ số ảnh và nên đóng camera. */
  onCapture: (dataUrl: string) => boolean;
}

async function reverseAddress(point: GeoPoint): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${point.lat}&lon=${point.lng}&accept-language=vi`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('reverse');
    const data = (await response.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };
    const parts = data.address;
    const line = parts
      ? [parts.road, parts.suburb || parts.quarter || parts.neighbourhood, parts.city || parts.town || parts.state]
          .filter(Boolean)
          .join(', ')
      : '';
    return line || data.display_name || `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
  } catch {
    return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
  }
}

function formatStampTime(date: Date): string {
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

const FieldPhotoCapture: React.FC<FieldPhotoCaptureProps> = ({
  photographer,
  sceneAddress,
  scenePoint,
  onClose,
  onCapture,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [ready, setReady] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [now, setNow] = React.useState(() => new Date());
  const [point, setPoint] = React.useState<GeoPoint | null>(scenePoint);
  const [address, setAddress] = React.useState(sceneAddress.trim());

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    let cancelled = false;
    const loadPlace = async () => {
      const nextPoint = scenePoint ?? (await getGeoPosition(EMPTY_MAP_CENTER));
      if (cancelled) return;
      setPoint(nextPoint);
      if (sceneAddress.trim()) {
        setAddress(sceneAddress.trim());
        return;
      }
      const label = await reverseAddress(nextPoint);
      if (!cancelled) setAddress(label);
    };
    void loadPlace();
    return () => {
      cancelled = true;
    };
  }, [sceneAddress, scenePoint]);

  React.useEffect(() => {
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
          setError('Không mở được camera. Bạn vẫn có thể chọn ảnh có sẵn.');
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
  }, []);

  const buildMeta = async (): Promise<FieldPhotoStampMeta> => {
    const nextPoint = scenePoint ?? point ?? (await getGeoPosition(EMPTY_MAP_CENTER));
    const nextAddress = sceneAddress.trim() || address || (await reverseAddress(nextPoint));
    return {
      capturedAt: new Date(),
      lat: nextPoint.lat,
      lng: nextPoint.lng,
      address: nextAddress,
      photographer,
    };
  };

  const finish = (dataUrl: string) => {
    const shouldClose = onCapture(dataUrl);
    if (shouldClose) onClose();
  };

  const handleCapture = async () => {
    const video = videoRef.current;
    if (!video || !ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await stampFieldVideoFrame(video, await buildMeta());
      finish(dataUrl);
    } catch {
      setError('Không chụp được ảnh. Thử lại hoặc chọn ảnh có sẵn.');
    } finally {
      setBusy(false);
    }
  };

  const handleGallery = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || busy) return;
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chọn được ảnh.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const dataUrl = await stampFieldImageFile(file, await buildMeta());
      finish(dataUrl);
    } catch {
      setError('Không đọc được ảnh. Thử ảnh khác.');
    } finally {
      setBusy(false);
    }
  };

  const coords = point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : 'Đang lấy tọa độ...';

  return (
    <div className="req-form-camera" role="dialog" aria-modal aria-label="Chụp ảnh hiện trường">
      <video ref={videoRef} className="req-form-camera__video" playsInline muted aria-hidden />
      <div className="req-form-camera__shade" aria-hidden />
      <button type="button" className="req-form-camera__close" onClick={onClose} aria-label="Đóng camera">
        <X size={22} strokeWidth={2} />
      </button>
      <div className="req-form-camera__stamp" aria-live="polite">
        <p>
          <span>Địa chỉ</span>
          <strong>{address || 'Đang lấy địa chỉ...'}</strong>
        </p>
        <p>
          <span>Tọa độ</span>
          <strong>{coords}</strong>
        </p>
        <p>
          <span>Thời gian</span>
          <strong>{formatStampTime(now)}</strong>
        </p>
        <p>
          <span>Người chụp</span>
          <strong>{photographer}</strong>
        </p>
      </div>
      {error && <p className="req-form-camera__error">{error}</p>}
      <div className="req-form-camera__tools">
        <button type="button" className="req-form-camera__gallery" onClick={() => fileRef.current?.click()} disabled={busy}>
          <ImagePlus size={18} strokeWidth={1.75} />
          Ảnh có sẵn
        </button>
        <button
          type="button"
          className="req-form-camera__shutter"
          onClick={() => void handleCapture()}
          disabled={!ready || busy}
          aria-label="Chụp ảnh"
        />
        <span />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          void handleGallery(event.target.files);
          event.target.value = '';
        }}
      />
    </div>
  );
};

export default FieldPhotoCapture;
