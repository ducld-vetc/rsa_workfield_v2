import React from 'react';
import { X } from 'lucide-react';
import { RESCUE_PHOTO_CATEGORIES, RescuePhotoCategory } from '../types';

interface RescuePhotosSectionProps {
  photos: Partial<Record<RescuePhotoCategory, string[]>>;
  title?: string;
  /** Hide section title and per-group header (dot, label, count) — e.g. báo giá */
  compact?: boolean;
}

const RescuePhotosSection: React.FC<RescuePhotosSectionProps> = ({
  photos,
  title = 'Hình ảnh cứu hộ',
  compact = false,
}) => {
  const [lightbox, setLightbox] = React.useState<{ src: string; label: string } | null>(null);

  const groups = RESCUE_PHOTO_CATEGORIES.map((cat) => ({
    ...cat,
    items: photos[cat.id] ?? [],
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <>
      <section
        className={`order-detail-photos${compact ? ' order-detail-photos--compact' : ''}`}
        aria-label={title}
      >
        {!compact && <p className="order-detail-photos__title">{title}</p>}
        {groups.map((group) => (
          <div key={group.id} className="order-detail-photos__group">
            {!compact && (
              <div className="order-detail-photos__head">
                <span
                  className={`order-detail-photos__dot order-detail-photos__dot--${group.id}`}
                  aria-hidden
                />
                <span className="order-detail-photos__label">{group.label}</span>
                <span className="order-detail-photos__count">{group.items.length}/{group.max}</span>
              </div>
            )}
            <div className="order-detail-photos__strip">
              {group.items.map((src, i) => (
                <button
                  key={`${group.id}-${src}`}
                  type="button"
                  className="order-detail-photos__item"
                  onClick={() => setLightbox({ src, label: `${group.label} — ảnh ${i + 1}` })}
                  aria-label={`Xem ${group.label.toLowerCase()}, ảnh ${i + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {lightbox && (
        <div
          className="order-detail-photos-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.label}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="order-detail-photos-lightbox__close"
            onClick={() => setLightbox(null)}
            aria-label="Đóng"
          >
            <X size={22} strokeWidth={2} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.label}
            className="order-detail-photos-lightbox__img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default RescuePhotosSection;
