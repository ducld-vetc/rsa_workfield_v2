export interface PhotoStampMeta {
  capturedAt: Date;
  lat: number;
  lng: number;
  address: string;
  photographer: string;
}

export interface PhotoStampLabels {
  time: string;
  seconds: string;
  date: string;
  address: string;
  coords: string;
  photographer: string;
}

export function formatStampLabels(meta: PhotoStampMeta): PhotoStampLabels {
  const capturedAt = meta.capturedAt;
  const pad = (value: number) => String(value).padStart(2, '0');
  return {
    time: `${pad(capturedAt.getHours())}:${pad(capturedAt.getMinutes())}`,
    seconds: pad(capturedAt.getSeconds()),
    date: `${pad(capturedAt.getDate())}/${pad(capturedAt.getMonth() + 1)}/${capturedAt.getFullYear()}`,
    address: meta.address.trim() || 'Chưa rõ',
    coords: `${meta.lat.toFixed(5)}, ${meta.lng.toFixed(5)}`,
    photographer: meta.photographer.trim() || 'Chưa rõ',
  };
}

async function drawStamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  meta: PhotoStampMeta,
): Promise<void> {
  const labels = formatStampLabels(meta);
  const scale = Math.max(width, height) / 1080;
  const pad = 20 * scale;
  const timeSize = 64 * scale;
  const smallSize = 18 * scale;
  const metaSize = 16 * scale;
  const font = getComputedStyle(document.documentElement).fontFamily || 'system-ui';
  const textW = width - pad * 2;

  ctx.save();
  ctx.font = `500 ${metaSize}px ${font}`;
  const addressLines = wrapCanvasLine(ctx, labels.address, textW, 2);
  const detailLines = [labels.coords, labels.photographer];
  const lineH = metaSize * 1.35;
  const belowH = (addressLines.length + detailLines.length) * lineH + 8 * scale;
  const y = height - pad - timeSize - belowH;

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 6 * scale;
  ctx.shadowOffsetY = scale;
  ctx.textBaseline = 'top';

  ctx.font = `500 ${timeSize}px ${font}`;
  ctx.fillText(labels.time, pad, y);
  const timeW = ctx.measureText(labels.time).width;

  ctx.font = `600 ${smallSize}px ${font}`;
  const secondsX = pad + timeW + 8 * scale;
  ctx.fillText(labels.seconds, secondsX, y + 8 * scale);
  const secondsW = ctx.measureText(labels.seconds).width;

  const barX = secondsX + secondsW + 12 * scale;
  const barH = timeSize * 0.62;
  const barY = y + (timeSize - barH) / 2;
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#f5c400';
  ctx.fillRect(barX, barY, 3 * scale, barH);

  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${smallSize}px ${font}`;
  ctx.fillText(labels.date, barX + 14 * scale, y + timeSize * 0.22);

  ctx.font = `500 ${metaSize}px ${font}`;
  let lineY = y + timeSize + 8 * scale;
  addressLines.forEach((line) => {
    ctx.fillText(line, pad, lineY, textW);
    lineY += lineH;
  });
  detailLines.forEach((line) => {
    ctx.fillText(line, pad, lineY, textW);
    lineY += lineH;
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

export interface FieldPhotoStampMeta {
  capturedAt: Date;
  lat: number;
  lng: number;
  address: string;
  photographer: string;
}

function wrapCanvasLine(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const lines: string[] = [];
  let current = '';
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(next).width > maxWidth) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1];
  kept[maxLines - 1] = last.length > 1 ? `${last.slice(0, last.length - 1)}…` : '…';
  return kept;
}

async function drawFieldStamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  meta: FieldPhotoStampMeta,
): Promise<void> {
  const scale = Math.max(width, height) / 1080;
  const pad = 14 * scale;
  const lineH = 20 * scale;
  const blockW = Math.min(width - pad * 2, 420 * scale);
  const textW = blockW - pad * 2;
  ctx.font = `600 ${13 * scale}px ${getComputedStyle(document.documentElement).fontFamily || 'system-ui'}`;
  const time = meta.capturedAt.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const rows = [
    `Địa chỉ: ${meta.address || 'Chưa rõ'}`,
    `Tọa độ: ${meta.lat.toFixed(5)}, ${meta.lng.toFixed(5)}`,
    `Thời gian: ${time}`,
    `Người chụp: ${meta.photographer || 'Chưa rõ'}`,
  ];
  const lines = rows.flatMap((row, index) => wrapCanvasLine(ctx, row, textW, index === 0 ? 2 : 1));
  const blockH = pad * 2 + lines.length * lineH;
  const x = pad;
  const y = height - blockH - pad;

  ctx.save();
  ctx.fillStyle = 'rgba(9, 27, 55, 0.72)';
  ctx.beginPath();
  ctx.roundRect(x, y, blockW, blockH, 12 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  lines.forEach((line, index) => {
    ctx.fillText(line, x + pad, y + pad + index * lineH, textW);
  });
  ctx.restore();
}

async function stampFieldCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  meta: FieldPhotoStampMeta,
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(source, 0, 0, width, height);
  await drawFieldStamp(ctx, width, height, meta);
  return canvas.toDataURL('image/jpeg', 0.9);
}

export async function stampFieldImageFile(file: File, meta: FieldPhotoStampMeta): Promise<string> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = objectUrl;
    });
    return stampFieldCanvas(img, img.naturalWidth, img.naturalHeight, meta);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function stampFieldVideoFrame(
  video: HTMLVideoElement,
  meta: FieldPhotoStampMeta,
): Promise<string> {
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) throw new Error('Camera not ready');
  return stampFieldCanvas(video, width, height, meta);
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
