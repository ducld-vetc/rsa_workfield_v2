import React from 'react';
import { useApp } from '../context/AppContext';

const ConnectionNotice: React.FC = () => {
  const { bufferNotice, syncNotice, dismissConnectionNotice } = useApp();
  const toast = syncNotice || bufferNotice;

  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(dismissConnectionNotice, 2800);
    return () => window.clearTimeout(timer);
  }, [toast, dismissConnectionNotice]);

  if (!toast) return null;

  return (
    <div className="connection-notice">
      <p className="connection-notice__toast" role="status">
        {toast}
      </p>
    </div>
  );
};

export default ConnectionNotice;
