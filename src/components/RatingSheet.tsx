import React from 'react';
import { Star } from 'lucide-react';
import { DlsBrandButton, DlsHomeIndicator, DlsSheetHeader } from '@dls/components';

interface RatingSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, note: string) => void;
}

const RatingSheet: React.FC<RatingSheetProps> = ({ open, onClose, onSubmit }) => {
  const [rating, setRating] = React.useState(0);
  const [note, setNote] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setRating(0);
      setNote('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="dls-sheet-overlay" role="dialog" aria-modal>
      <div className="dls-sheet">
        <DlsSheetHeader title="Đánh giá khách hàng" onClose={onClose} />
        <div className="dls-sheet-body dls-rating-body">
          <p className="dls-rating-hint">Bạn hài lòng với khách hàng không?</p>
          <div className="dls-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`dls-star-btn ${n <= rating ? 'dls-star-btn--on' : ''}`}
                onClick={() => setRating(n)}
                aria-label={`${n} sao`}
              >
                <Star size={32} fill={n <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <textarea
            className="dls-textarea"
            placeholder="Ghi chú (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>
        <div className="dls-sheet-footer">
          <DlsBrandButton onClick={() => onSubmit(rating, note)} disabled={rating === 0}>
            Gửi đánh giá
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  );
};

export default RatingSheet;
