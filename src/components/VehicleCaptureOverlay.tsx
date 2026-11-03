import React from 'react';
import { CaptureOverlayKind } from '../types';

interface VehicleCaptureOverlayProps {
  kind: CaptureOverlayKind;
  /** Bước trong một mã nhiều ảnh: góc C2 hoặc khoang A11 */
  step?: number;
}

const VehicleCaptureOverlay: React.FC<VehicleCaptureOverlayProps> = ({ kind, step = 0 }) => (
  <div className="vehicle-capture-overlay" aria-hidden>
    <svg className="vehicle-capture-overlay__svg" viewBox="0 0 200 260">
      <Frame />
      {renderGuide(kind, step)}
    </svg>
  </div>
);

function Frame() {
  const x = 22;
  const y = 34;
  const w = 156;
  const h = 190;
  const arm = 28;
  const d = [
    `M ${x} ${y + arm} V ${y} H ${x + arm}`,
    `M ${x + w - arm} ${y} H ${x + w} V ${y + arm}`,
    `M ${x + w} ${y + h - arm} V ${y + h} H ${x + w - arm}`,
    `M ${x + arm} ${y + h} H ${x} V ${y + h - arm}`,
  ].join(' ');
  return (
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function renderGuide(kind: CaptureOverlayKind, step: number) {
  switch (kind) {
    case 'scene':
      return <SceneGuide />;
    case 'plate':
      return <PlateGuide />;
    case 'front-left':
      return <CornerGuide corner="fl" />;
    case 'front-right':
      return <CornerGuide corner="fr" />;
    case 'rear-left':
      return <CornerGuide corner="rl" />;
    case 'rear-right':
      return <CornerGuide corner="rr" />;
    case 'corners':
      return <CornerGuide corner={(['fl', 'fr', 'rl', 'rr'] as const)[step % 4]} />;
    case 'damage':
      return <DamageGuide />;
    case 'dashboard':
      return <DashboardGuide />;
    case 'document':
      return <DocumentGuide signed={false} />;
    case 'signed':
      return <DocumentGuide signed />;
    case 'fault':
      return <FaultGuide />;
    case 'interior':
      return <InteriorGuide trunk={step % 2 === 1} />;
    case 'action':
      return <ActionGuide />;
    case 'flatbed':
      return <FlatbedGuide />;
    case 'strap':
      return <StrapGuide />;
    case 'receipt':
      return <ReceiptGuide />;
    case 'handover':
      return <HandoverGuide />;
    default:
      return null;
  }
}

function SceneGuide() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M28 168h144" opacity="0.45" />
      <path d="M36 168l18-28h18l8 28" />
      <path d="M128 168l10-36h22l12 36" />
      <g className="vehicle-capture-overlay__target" strokeWidth="2.2">
        <path d="M62 168v-16l14-10h46l16 10v16" />
        <path d="M78 142l8-16h28l10 16" />
        <circle cx="82" cy="168" r="7" />
        <circle cx="122" cy="168" r="7" />
      </g>
    </g>
  );
}

function PlateGuide() {
  return (
    <g className="vehicle-capture-overlay__target">
      <rect x="36" y="108" width="128" height="44" rx="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <text x="100" y="135" textAnchor="middle" fill="currentColor" fontSize="13" fontWeight="700">
        BIỂN SỐ
      </text>
    </g>
  );
}

function CornerGuide({ corner }: { corner: 'fl' | 'fr' | 'rl' | 'rr' }) {
  const stand = {
    fl: { cx: 52, cy: 78 },
    fr: { cx: 148, cy: 78 },
    rl: { cx: 52, cy: 188 },
    rr: { cx: 148, cy: 188 },
  }[corner];

  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="74" y="78" width="52" height="104" rx="12" />
      <path d="M82 98h36" />
      <text x="100" y="72" textAnchor="middle" fill="currentColor" fontSize="10">
        Trước
      </text>
      <g className="vehicle-capture-overlay__target" strokeWidth="2.4">
        <circle cx={stand.cx} cy={stand.cy} r="18" />
        <text
          x={stand.cx}
          y={stand.cy + 4}
          textAnchor="middle"
          fill="currentColor"
          fontSize="9"
          fontWeight="700"
          stroke="none"
        >
          45°
        </text>
      </g>
    </g>
  );
}

function DamageGuide() {
  return (
    <g className="vehicle-capture-overlay__target" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="100" cy="130" r="42" />
      <circle cx="100" cy="130" r="6" />
      <path d="M100 96v12M100 152v12M68 130h12M120 130h12" />
      <path d="M86 118l10 8M114 142l-8-6" strokeWidth="1.6" />
    </g>
  );
}

function DashboardGuide() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M40 150h120l-14-36H54z" />
      <circle cx="68" cy="132" r="12" />
      <g className="vehicle-capture-overlay__target" strokeWidth="2.4">
        <rect x="108" y="112" width="36" height="22" rx="4" />
        <text x="126" y="127" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="700" stroke="none">
          ODO
        </text>
      </g>
    </g>
  );
}

function DocumentGuide({ signed }: { signed: boolean }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="58" y="48" width="84" height="150" rx="6" />
      <path d="M70 72h60M70 88h60M70 104h48M70 120h56" opacity="0.7" />
      {signed ? (
        <g className="vehicle-capture-overlay__target" strokeWidth="2.2">
          <path d="M70 158c8-10 14 8 22-2s12 10 20-4 12 6 18-2" />
          <path d="M70 172h48" />
        </g>
      ) : (
        <circle cx="118" cy="162" r="12" opacity="0.8" />
      )}
    </g>
  );
}

function FaultGuide() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M48 168h104v-20l-16-24H70l-22 24z" />
      <circle cx="70" cy="168" r="8" />
      <circle cx="130" cy="168" r="8" />
      <g className="vehicle-capture-overlay__target" strokeWidth="2.2">
        <rect x="96" y="96" width="40" height="40" rx="6" />
        <path d="M108 118l6-14 6 14M114 122v4" />
      </g>
    </g>
  );
}

function InteriorGuide({ trunk }: { trunk: boolean }) {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <g className={trunk ? undefined : 'vehicle-capture-overlay__target'} strokeWidth="2.2">
        <rect x="36" y="70" width="70" height="90" rx="8" />
        <path d="M48 96h46M48 112c10 8 36 8 46 0" />
        <text x="71" y="148" textAnchor="middle" fill="currentColor" fontSize="9" stroke="none">
          Lái
        </text>
      </g>
      <g className={trunk ? 'vehicle-capture-overlay__target' : undefined} strokeWidth="2.2">
        <rect x="114" y="78" width="52" height="74" rx="8" />
        <text x="140" y="120" textAnchor="middle" fill="currentColor" fontSize="9" stroke="none">
          Cốp
        </text>
      </g>
    </g>
  );
}

function ActionGuide() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M40 176h120v-18l-20-28H64L40 158z" />
      <circle cx="68" cy="176" r="8" />
      <circle cx="132" cy="176" r="8" />
      <g className="vehicle-capture-overlay__target" strokeWidth="2.2">
        <circle cx="118" cy="118" r="28" />
        <path d="M108 118h20M118 108v20" />
      </g>
    </g>
  );
}

function FlatbedGuide() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M28 176h150" />
      <path d="M36 176v-28h92v28" />
      <circle cx="58" cy="176" r="8" />
      <circle cx="112" cy="176" r="8" />
      <path d="M128 176v-36h28l12 16v20" />
      <circle cx="156" cy="176" r="8" />
      <g className="vehicle-capture-overlay__target" strokeWidth="2.2">
        <path d="M48 148h68v-16l-12-12H62l-14 12z" />
        <circle cx="64" cy="148" r="5" />
        <circle cx="100" cy="148" r="5" />
      </g>
    </g>
  );
}

function StrapGuide() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="58" y="88" width="84" height="84" rx="10" />
      <g className="vehicle-capture-overlay__target" strokeWidth="2.4">
        <path d="M68 98l14 14M82 98L68 112" />
        <path d="M118 98l14 14M132 98l-14 14" />
        <path d="M68 148l14 14M82 148l-14 14" />
        <path d="M118 148l14 14M132 148l-14 14" />
        <path d="M82 112h36M82 148h36" />
      </g>
    </g>
  );
}

function ReceiptGuide() {
  return (
    <g className="vehicle-capture-overlay__target" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M72 52h56v150l-8-6-8 6-8-6-8 6-8-6-8 6-8-6z" />
      <path d="M84 74h32M84 90h32M84 106h24M84 126h28" />
    </g>
  );
}

function HandoverGuide() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M36 150h40v-28H48l-12 12z" opacity="0.7" />
      <path d="M124 118h40v40h-28l-12-16z" opacity="0.7" />
      <g className="vehicle-capture-overlay__target" strokeWidth="2.2">
        <path d="M70 186v-20l16-14h32l18 14v20" />
        <circle cx="90" cy="186" r="7" />
        <circle cx="122" cy="186" r="7" />
        <path d="M100 64c-14 16-14 28 0 28s14-12 0-28z" />
        <circle cx="100" cy="86" r="4" fill="currentColor" stroke="none" />
      </g>
    </g>
  );
}

export default VehicleCaptureOverlay;
