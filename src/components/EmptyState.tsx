import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState: React.FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="dm-empty-state">
    <div className="dm-empty-state__icon">
      <Inbox size={32} strokeWidth={1.5} />
    </div>
    <p className="dm-empty-state__title">{title}</p>
    {hint && <p className="dm-empty-state__hint">{hint}</p>}
  </div>
);
