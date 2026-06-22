import React from 'react';
import { GeoPoint } from '../types';
import { openGoogleMaps } from '../utils/maps';

interface AddressMapLinkProps {
  address: string;
  coords?: GeoPoint;
  className?: string;
  ariaLabel?: string;
  /** Dùng span khi nằm trong button cha (tránh button lồng button). */
  as?: 'button' | 'span';
}

const AddressMapLink: React.FC<AddressMapLinkProps> = ({
  address,
  coords,
  className,
  ariaLabel,
  as = 'button',
}) => {
  const trimmed = address.trim();
  const canOpen = Boolean(trimmed || coords);

  if (!canOpen) return null;

  const classNames = ['rescue-sheet__address-link', className].filter(Boolean).join(' ');
  const label = ariaLabel ?? `Mở Google Maps — ${trimmed || 'địa chỉ'}`;

  const openMaps = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    openGoogleMaps(trimmed, coords);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openMaps(e);
    }
  };

  if (as === 'span') {
    return (
      <span
        role="button"
        tabIndex={0}
        className={classNames}
        onClick={openMaps}
        onKeyDown={onKeyDown}
        aria-label={label}
      >
        {trimmed}
      </span>
    );
  }

  return (
    <button type="button" className={classNames} onClick={openMaps} aria-label={label}>
      {trimmed}
    </button>
  );
};

export default AddressMapLink;
