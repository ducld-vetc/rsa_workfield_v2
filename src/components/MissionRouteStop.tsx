import React from 'react';
import { Navigation } from 'lucide-react';
import { openGoogleMaps } from '../utils/maps';
import AddressMapLink from './AddressMapLink';

interface MissionRouteStopProps {
  label: string;
  address: string;
  onBeforeOpen?: (e: React.MouseEvent) => void;
  mapButtonLabel?: string;
}

const MissionRouteStop: React.FC<MissionRouteStopProps> = ({
  label,
  address,
  onBeforeOpen,
  mapButtonLabel = 'Maps',
}) => (
  <div className="mission-route-block">
    <div className="mission-route-block__head">
      <span className="mission-route-block__label">{label}</span>
      <button
        type="button"
        className="mission-route-block__map"
        onClick={(e) => {
          onBeforeOpen?.(e);
          openGoogleMaps(address);
        }}
        aria-label={`Mở Google Maps — ${label}`}
      >
        <Navigation size={15} strokeWidth={2} aria-hidden />
        <span>{mapButtonLabel}</span>
      </button>
    </div>
    <AddressMapLink className="mission-route-block__addr" address={address} />
  </div>
);

export default MissionRouteStop;
