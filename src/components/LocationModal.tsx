import React from 'react';
import { LocateFixed } from 'lucide-react';
import { DlsBrandButton } from '@dls/components';
import { useApp } from '../context/AppContext';

const STEP_MS = 450;

const Requirement: React.FC<{ ok: boolean; title: string; detail: string }> = ({
  ok,
  title,
  detail,
}) => (
  <li className={`location-gate__row${ok ? ' location-gate__row--ok' : ''}`}>
    <span className="location-gate__copy">
      <span className="location-gate__name">{title}</span>
      <span className="location-gate__detail">{detail}</span>
    </span>
    <span className="location-gate__status">{ok ? 'Đã bật' : 'Chưa bật'}</span>
  </li>
);

/** Màn chặn demo: vào ứng dụng khi đã bật quyền vị trí và GPS. */
export const LocationPermissionGate: React.FC = () => {
  const { locationGateOn } = useApp();
  const [phase, setPhase] = React.useState<'blocked' | 'ready'>('blocked');
  const [locationOn, setLocationOn] = React.useState(false);
  const [gpsOn, setGpsOn] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const timers = React.useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  React.useEffect(() => {
    clearTimers();
    if (!locationGateOn) return;
    setPhase('blocked');
    setLocationOn(false);
    setGpsOn(false);
    setBusy(false);
    return clearTimers;
  }, [locationGateOn]);

  const grant = () => {
    if (busy) return;
    clearTimers();
    setBusy(true);
    timers.current = [
      window.setTimeout(() => setLocationOn(true), STEP_MS),
      window.setTimeout(() => setGpsOn(true), STEP_MS * 2),
      window.setTimeout(() => {
        setBusy(false);
        setPhase('ready');
      }, STEP_MS * 3),
    ];
  };

  if (!locationGateOn || phase === 'ready') return null;

  return (
    <div
      className="location-gate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-gate-title"
    >
      <div className="location-gate__body">
        <div className="location-gate__icon" aria-hidden="true">
          <LocateFixed size={28} />
        </div>
        <h1 id="location-gate-title">Bật vị trí để vận hành cứu hộ</h1>
        <p>
          VETC Cứu hộ cần quyền vị trí và GPS đang bật để phục vụ vận hành cứu hộ.
        </p>
        <ul className="location-gate__list">
          <Requirement ok={locationOn} title="Quyền vị trí" detail="Chia sẻ vị trí trong quá trình cứu hộ" />
          <Requirement ok={gpsOn} title="GPS của thiết bị" detail="Định vị vị trí trong quá trình cứu hộ" />
        </ul>
      </div>
      <DlsBrandButton onClick={grant} disabled={busy}>
        {busy ? 'Đang xin quyền' : 'Cấp quyền'}
      </DlsBrandButton>
    </div>
  );
};
