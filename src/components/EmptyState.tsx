import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState: React.FC<{
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ title, hint, actionLabel, onAction }) => (
  <div className="dm-empty-state">
    <div className="dm-empty-state__icon">
      <Inbox size={32} strokeWidth={1.5} />
    </div>
    <p className="dm-empty-state__title">{title}</p>
    {hint && <p className="dm-empty-state__hint">{hint}</p>}
    {actionLabel && onAction && (
      <button type="button" className="dm-empty-state__action" onClick={onAction}>
        {actionLabel}
      </button>
    )}
  </div>
);
