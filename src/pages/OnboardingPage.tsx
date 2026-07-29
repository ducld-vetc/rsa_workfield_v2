import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DlsBrandButton } from '@dls/components';
import { OnboardingVisual } from '../components/OnboardingVisual';
import { useApp } from '../context/AppContext';
import { DriverRole } from '../types';
import { getOnboardingSteps, markOnboardingDone } from '../utils/onboarding';

const HOME: Record<DriverRole, string> = {
  'quote-rescue': '/home',
  'quote-only': '/quotes',
  'rescue-only': '/home',
};

const SWIPE_MIN_PX = 56;

interface OnboardingPageProps {
  onFinished?: () => void;
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onFinished }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { driverRole } = useApp();
  const steps = React.useMemo(() => getOnboardingSteps(driverRole), [driverRole]);
  const [index, setIndex] = React.useState(0);
  const touchStartX = React.useRef<number | null>(null);
  const step = steps[index];
  const isLast = index >= steps.length - 1;
  const isReplay = params.get('replay') === '1';

  const finish = () => {
    markOnboardingDone();
    if (!isReplay) onFinished?.();
    navigate(HOME[driverRole], { replace: true });
  };

  const goNext = () => {
    if (isLast) finish();
    else setIndex((i) => i + 1);
  };

  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const handleSwipeDelta = (delta: number) => {
    if (Math.abs(delta) < SWIPE_MIN_PX) return;
    // Vuốt trái → xem lại; vuốt phải → bước tiếp
    if (delta < 0) goPrev();
    else if (!isLast) setIndex((i) => i + 1);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX == null) return;
    const endX = e.changedTouches[0]?.clientX;
    if (endX == null) return;
    handleSwipeDelta(endX - startX);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    touchStartX.current = e.clientX;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX == null) return;
    handleSwipeDelta(e.clientX - startX);
  };

  if (!step) {
    finish();
    return null;
  }

  return (
    <div className="dm-screen grab-guide">
      <header className="grab-guide__top">
        <button type="button" className="grab-guide__skip" onClick={finish}>
          {isReplay ? 'Đóng' : 'Bỏ qua'}
        </button>
        <div className="grab-guide__dots" aria-label={`Bước ${index + 1}/${steps.length}`}>
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`grab-guide__dot${i === index ? ' grab-guide__dot--on' : ''}${
                i < index ? ' grab-guide__dot--done' : ''
              }`}
            />
          ))}
        </div>
        <span className="grab-guide__count">
          {index + 1}/{steps.length}
        </span>
      </header>

      <div
        className="grab-guide__body"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <OnboardingVisual stepId={step.id} />
        <div className="grab-guide__copy">
          <h1>{step.title}</h1>
          <p>{step.caption}</p>
        </div>
      </div>

      <div className="grab-guide__footer">
        <DlsBrandButton onClick={goNext}>
          {isLast ? (isReplay ? 'Xong' : 'Bắt đầu làm việc') : 'Tiếp tục'}
        </DlsBrandButton>
        <div className="grab-guide__home" aria-hidden>
          <div className="grab-guide__home-bar" />
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
