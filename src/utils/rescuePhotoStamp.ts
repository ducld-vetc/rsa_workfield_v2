import vetcLogoUrl from '../assets/vetc-logo.png';

export interface PhotoStampMeta {
  capturedAt: Date;
  lat: number;
  lng: number;
}

export interface PhotoStampLabels {
  clock: string;
  datetime: string;
  coords: string;
}

let logoImage: HTMLImageElement | null = null;

function loadLogo(): Promise<HTMLImageElement> {
  if (logoImage?.complete) return Promise.resolve(logoImage);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      logoImage = img;
      resolve(img);
    };
    img.onerror = reject;
    img.src = vetcLogoUrl;
  });
}

export function formatStampLabels(meta: PhotoStampMeta): PhotoStampLabels {
  const { capturedAt, lat, lng } = meta;
  const clock = capturedAt.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const datetime = capturedAt.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const coords = `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
  return { clock, datetime, coords };
}

async function drawStamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  meta: PhotoStampMeta,
): Promise<void> {
  const labels = formatStampLabels(meta);
  const logo = await loadLogo();
  const scale = Math.max(width, height) / 1080;
  const pad = 12 * scale;
  const logoW = 56 * scale;
  const logoH = (logo.height / logo.width) * logoW;
  const lineH = 18 * scale;
  const blockW = Math.min(width * 0.72, 320 * scale);
  const blockH = pad * 2 + logoH + lineH * 3 + 8 * scale;
  const x = pad;
  const y = height - blockH - pad;

  ctx.save();
  ctx.fillStyle = 'rgba(9, 27, 55, 0.62)';
  ctx.beginPath();
  const r = 10 * scale;
  ctx.roundRect(x, y, blockW, blockH, r);
  ctx.fill();

  ctx.drawImage(logo, x + pad, y + pad, logoW, logoH);

  const textX = x + pad + logoW + 10 * scale;
  const textY = y + pad + logoH * 0.15;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  ctx.font = `700 ${14 * scale}px ${getComputedStyle(document.documentElement).fontFamily || 'system-ui'}`;
  ctx.fillText('VETC RSA', textX, textY);

  ctx.font = `600 ${12 * scale}px ${getComputedStyle(document.documentElement).fontFamily || 'system-ui'}`;
  const lines = [labels.clock, labels.datetime, labels.coords];
  lines.forEach((line, i) => {
    ctx.fillText(line, x + pad, y + pad + logoH + 6 * scale + i * lineH);
  });
  ctx.restore();
}

export async function stampCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  meta: PhotoStampMeta,
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.drawImage(source, 0, 0, width, height);
  await drawStamp(ctx, width, height, meta);
  return canvas.toDataURL('image/jpeg', 0.9);
}

export async function stampImageFile(file: File, meta: PhotoStampMeta): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });
    return stampCanvas(img, img.naturalWidth, img.naturalHeight, meta);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function stampVideoFrame(
  video: HTMLVideoElement,
  meta: PhotoStampMeta,
): Promise<string> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) throw new Error('Camera not ready');
  return stampCanvas(video, width, height, meta);
}

export function getGeoPosition(
  fallback: { lat: number; lng: number },
): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(fallback);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(fallback),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  });
}
