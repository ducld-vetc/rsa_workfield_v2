import React from 'react';
import { BatteryFull, Signal, Wifi } from 'lucide-react';

/** Status bar + Dynamic Island + home indicator — desktop preview only. */
const DeviceChrome: React.FC = () => (
  <div className="dm-device-chrome" aria-hidden="true">
    <div className="dm-status-bar">
      <span className="dm-status-bar__time">9:41</span>
      <div className="dm-status-bar__island" />
      <div className="dm-status-bar__icons">
        <Signal size={15} strokeWidth={2.25} />
        <Wifi size={15} strokeWidth={2.25} />
        <BatteryFull size={20} strokeWidth={1.75} />
      </div>
    </div>
    <div className="dm-home-indicator-chrome">
      <div className="dm-home-indicator-chrome__bar" />
    </div>
  </div>
);

export default DeviceChrome;
