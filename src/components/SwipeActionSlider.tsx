import React from 'react';
import { ChevronsRight } from 'lucide-react';

interface SwipeActionSliderProps {
  label: string;
  onComplete: () => void;
  disabled?: boolean;
}

const THRESHOLD = 0.82;

const SwipeActionSlider: React.FC<SwipeActionSliderProps> = ({
  label,
  onComplete,
  disabled = false,
}) => {
  const trackRef = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);
  const dragStart = React.useRef({ x: 0, startOffset: 0 });

  const maxOffset = React.useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    const thumbWidth = 52;
    const padding = 8;
    return Math.max(0, track.clientWidth - thumbWidth - padding);
  }, []);

  const reset = () => setOffset(0);

  const complete = () => {
    reset();
    onComplete();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, startOffset: offset };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || disabled) return;
    const delta = e.clientX - dragStart.current.x;
    const next = Math.min(maxOffset(), Math.max(0, dragStart.current.startOffset + delta));
    setOffset(next);
  };

  const onPointerUp = () => {
    if (!dragging || disabled) return;
    setDragging(false);
    const max = maxOffset();
    if (max > 0 && offset / max >= THRESHOLD) {
      complete();
      return;
    }
    reset();
  };

  return (
    <div
      ref={trackRef}
      className={`rescue-swipe${disabled ? ' rescue-swipe--disabled' : ''}`}
      aria-label={label}
    >
      <span
        className="rescue-swipe__label"
        style={{ opacity: Math.max(0, 1 - offset / Math.max(maxOffset(), 1)) }}
      >
        {label}
      </span>
      <button
        type="button"
        className="rescue-swipe__thumb"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        disabled={disabled}
        aria-label={label}
      >
        <ChevronsRight size={20} strokeWidth={2.25} />
      </button>
    </div>
  );
};

export default SwipeActionSlider;
