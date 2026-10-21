import React from 'react';
import { Camera, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import RescueCameraCapture from '../components/RescueCameraCapture';
import { useApp } from '../context/AppContext';
import { DlsBrandButton, DlsHomeIndicator, DlsTopNav } from '@dls/components';
import { RESCUE_PHOTO_CATEGORIES, RescuePhotoCategory, RescueOrder } from '../types';
import { getOrderPickup } from '../utils/orderMap';
import { getGeoPosition, stampImageFile } from '../utils/rescuePhotoStamp';

function getPhotosForCategory(order: RescueOrder, category: RescuePhotoCategory): string[] {
  const field = RESCUE_PHOTO_CATEGORIES.find((c) => c.id === category)?.field;
  if (!field) return [];
  return order[field] ?? [];
}

function buildDraftFromOrder(order: RescueOrder): Record<RescuePhotoCategory, string[]> {
  return {
    'hien-truong': getPhotosForCategory(order, 'hien-truong'),
    'qua-trinh': getPhotosForCategory(order, 'qua-trinh'),
    'hoan-tat': getPhotosForCategory(order, 'hoan-tat'),
  };
}

function emptyDraft(): Record<RescuePhotoCategory, string[]> {
  return { 'hien-truong': [], 'qua-trinh': [], 'hoan-tat': [] };
}

function draftsEqual(
  a: Record<RescuePhotoCategory, string[]>,
  b: Record<RescuePhotoCategory, string[]>,
): boolean {
  return RESCUE_PHOTO_CATEGORIES.every((cat) => {
    const left = a[cat.id];
    const right = b[cat.id];
    return left.length === right.length && left.every((src, index) => src === right[index]);
  });
}

const CameraPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getOrder, updateOrder, currentDriverName, poorConnection, enqueueSync, noteBuffered } = useApp();
  const order = getOrder(id ?? '');

  const [draft, setDraft] = React.useState<Record<RescuePhotoCategory, string[]>>(emptyDraft);
  const [sourcePickerCategory, setSourcePickerCategory] =
    React.useState<RescuePhotoCategory | null>(null);
  const [captureCategory, setCaptureCategory] = React.useState<RescuePhotoCategory | null>(null);
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [busyCategory, setBusyCategory] = React.useState<RescuePhotoCategory | null>(null);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!order) return;
    setDraft(buildDraftFromOrder(order));
  }, [order?.id]);

  const savedSnapshot = order ? buildDraftFromOrder(order) : emptyDraft();
  const hasChanges = !draftsEqual(draft, savedSnapshot);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/home');
  };

  const appendToDraft = (categoryId: RescuePhotoCategory, dataUrl: string): boolean => {
    const cat = RESCUE_PHOTO_CATEGORIES.find((c) => c.id === categoryId)!;
    let atLimit = false;
    let added = false;
    setDraft((prev) => {
      if (prev[categoryId].length >= cat.max) {
        atLimit = true;
        return prev;
      }
      added = true;
      const next = [...prev[categoryId], dataUrl].slice(0, cat.max);
      atLimit = next.length >= cat.max;
      return { ...prev, [categoryId]: next };
    });
    if (added && poorConnection) {
      enqueueSync({ kind: 'photo', orderId: id ?? '', label: `Ảnh ${cat.label}` });
    }
    return atLimit;
  };

  const removeFromDraft = (categoryId: RescuePhotoCategory, index: number) => {
    setDraft((prev) => ({
      ...prev,
      [categoryId]: prev[categoryId].filter((_, i) => i !== index),
    }));
  };

  const openSourcePicker = (categoryId: RescuePhotoCategory) => {
    setSourcePickerCategory(categoryId);
  };

  const closeSourcePicker = () => {
    setSourcePickerCategory(null);
  };

  const startCamera = () => {
    if (!sourcePickerCategory) return;
    setCaptureCategory(sourcePickerCategory);
    setCameraOpen(true);
    closeSourcePicker();
  };

  const startGallery = () => {
    if (!sourcePickerCategory) return;
    setCaptureCategory(sourcePickerCategory);
    closeSourcePicker();
    uploadInputRef.current?.click();
  };

  const handleGalleryPick = async (files: FileList | null) => {
    if (!files?.length || !captureCategory) return;

    const cat = RESCUE_PHOTO_CATEGORIES.find((c) => c.id === captureCategory)!;
    setBusyCategory(captureCategory);
    try {
      const latest = getOrder(id ?? '');
      if (!latest) return;

      const fallback = getOrderPickup(latest);
      const geo = await getGeoPosition(fallback);
      const meta = {
        capturedAt: new Date(),
        lat: geo.lat,
        lng: geo.lng,
        address: latest.address,
        photographer: currentDriverName,
      };

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const stamped = await stampImageFile(file, meta);
        const full = appendToDraft(captureCategory, stamped);
        if (full) break;
      }
    } finally {
      setBusyCategory(null);
      setCaptureCategory(null);
    }
  };

  const handleSave = () => {
    if (!order || !hasChanges) return;
    const updates: Partial<RescueOrder> = {};
    RESCUE_PHOTO_CATEGORIES.forEach((cat) => {
      updates[cat.field] = draft[cat.id].slice(0, cat.max);
    });
    updateOrder(order.id, updates);
    if (poorConnection) noteBuffered();
    goBack();
  };

  if (!order) {
    return (
      <div className="dm-screen">
        <DlsTopNav title="Chụp ảnh" onBack={goBack} />
        <p className="dm-empty">Không tìm thấy đơn.</p>
        <DlsHomeIndicator />
      </div>
    );
  }

  return (
    <div className="dm-screen">
      <DlsTopNav title="Chụp ảnh cứu hộ" onBack={goBack} />

      <div className="rescue-camera rescue-camera--simple">
        {poorConnection && (
          <p className="rescue-camera__pending" role="status">
            Ảnh chờ gửi khi kết nối ổn định.
          </p>
        )}
        <div className="rescue-camera__groups">
          {RESCUE_PHOTO_CATEGORIES.map((cat) => {
            const photos = draft[cat.id];
            const atLimit = photos.length >= cat.max;
            const busy = busyCategory === cat.id;

            return (
              <section key={cat.id} className="rescue-camera__group" aria-label={cat.label}>
                <div className="rescue-camera__group-head">
                  <h2 className="rescue-camera__group-title">{cat.label}</h2>
                  <span className="rescue-camera__group-count">
                    {photos.length}/{cat.max}
                  </span>
                </div>

                <p className="rescue-camera__group-hint">{cat.hint}</p>

                <div className="rescue-camera__thumb-row">
                  {!atLimit && (
                    <button
                      type="button"
                      className="rescue-camera__add-tile"
                      disabled={busy}
                      aria-label={`Thêm ảnh ${cat.label}`}
                      onClick={() => openSourcePicker(cat.id)}
                    >
                      <Camera size={20} strokeWidth={1.75} />
                      <span>Chụp ảnh</span>
                    </button>
                  )}

                  {photos.map((src, index) => (
                    <div key={`${cat.id}-${index}`} className="rescue-camera__thumb-wrap">
                      <img className="rescue-camera__thumb-img" src={src} alt="" />
                      <button
                        type="button"
                        className="rescue-camera__thumb-remove"
                        aria-label="Xoá ảnh"
                        onClick={() => removeFromDraft(cat.id, index)}
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <input
          ref={uploadInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            void handleGalleryPick(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      <div className="dls-fixed-bar">
        <div className="dls-fixed-bar__actions">
          <DlsBrandButton onClick={handleSave} disabled={!hasChanges}>
            Lưu thông tin
          </DlsBrandButton>
        </div>
      </div>

      {sourcePickerCategory && (
        <div
          className="rescue-camera-source"
          role="dialog"
          aria-modal
          aria-label="Chọn nguồn ảnh"
          onClick={closeSourcePicker}
        >
          <div
            className="rescue-camera-source__sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="rescue-camera-source__title">Thêm ảnh</p>
            <button type="button" className="rescue-camera-source__option" onClick={startCamera}>
              <Camera size={18} strokeWidth={1.75} />
              Mở camera
            </button>
            <button type="button" className="rescue-camera-source__option" onClick={startGallery}>
              Chọn từ thư viện
            </button>
            <button
              type="button"
              className="rescue-camera-source__cancel"
              onClick={closeSourcePicker}
            >
              Huỷ
            </button>
          </div>
        </div>
      )}

      {captureCategory && (
        <RescueCameraCapture
          open={cameraOpen}
          order={order}
          onClose={() => {
            setCameraOpen(false);
            setCaptureCategory(null);
          }}
          onCapture={(dataUrl) => appendToDraft(captureCategory, dataUrl)}
        />
      )}

      <DlsHomeIndicator />
    </div>
  );
};

export default CameraPage;
