import React from 'react';
import { Trash2 } from 'lucide-react';
import { StaffMember } from '../utils/staff';

const DELETE_WIDTH = 76;
const OPEN_THRESHOLD = 40;

interface StaffSwipeRowProps {
  member: StaffMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenDetail: () => void;
  onDelete: () => void;
  initials: string;
}

const StaffSwipeRow: React.FC<StaffSwipeRowProps> = ({
  member,
  open,
  onOpenChange,
  onOpenDetail,
  onDelete,
  initials,
}) => {
  const [offset, setOffset] = React.useState(0);
  const startXRef = React.useRef(0);
  const startYRef = React.useRef(0);
  const startOffsetRef = React.useRef(0);
  const draggingRef = React.useRef(false);
  const axisLockRef = React.useRef<'x' | 'y' | null>(null);
  const movedRef = React.useRef(false);

  React.useEffect(() => {
    setOffset(open ? -DELETE_WIDTH : 0);
  }, [open]);

  const clampOffset = (value: number) => Math.min(0, Math.max(-DELETE_WIDTH, value));

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    axisLockRef.current = null;
    movedRef.current = false;
    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    startOffsetRef.current = offset;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = event.clientX - startXRef.current;
    const dy = event.clientY - startYRef.current;

    if (!axisLockRef.current) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      axisLockRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }

    if (axisLockRef.current !== 'x') return;

    movedRef.current = true;
    setOffset(clampOffset(startOffsetRef.current + dx));
  };

  const finishGesture = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    if (axisLockRef.current === 'x') {
      const shouldOpen = offset <= -OPEN_THRESHOLD;
      setOffset(shouldOpen ? -DELETE_WIDTH : 0);
      onOpenChange(shouldOpen);
    }

    axisLockRef.current = null;
  };

  const handleContentClick = () => {
    if (movedRef.current) return;
    if (open) {
      onOpenChange(false);
      return;
    }
    onOpenDetail();
  };

  return (
    <div className={`grab-staff-swipe${open ? ' grab-staff-swipe--open' : ''}`}>
      <button
        type="button"
        className="grab-staff-swipe__delete"
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
        aria-label={`Xoá ${member.fullName}`}
      >
        <Trash2 size={20} strokeWidth={2} />
      </button>

      <div
        className="grab-staff-swipe__content"
        style={{ transform: `translateX(${offset}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishGesture}
        onPointerCancel={finishGesture}
        onClick={handleContentClick}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleContentClick();
          }
        }}
      >
        <article className="grab-staff-row">
          <span className="grab-staff-row__avatar" aria-hidden>
            {initials}
          </span>
          <div className="grab-staff-row__content">
            <div className="grab-staff-row__top">
              <h3>{member.fullName}</h3>
              <span
                className={`grab-staff-status ${
                  member.status === 'active'
                    ? 'grab-staff-status--active'
                    : 'grab-staff-status--paused'
                }`}
              >
                {member.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            <p className="grab-staff-row__role">{member.role}</p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default StaffSwipeRow;
