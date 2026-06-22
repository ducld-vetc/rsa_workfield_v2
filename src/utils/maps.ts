export const googleMapsSearchUrl = (
  address: string,
  coords?: { lat: number; lng: number },
) => {
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
};

export const openGoogleMaps = (
  address: string,
  coords?: { lat: number; lng: number },
) => {
  const trimmed = address.trim();
  if (!trimmed && !coords) return;
  window.open(googleMapsSearchUrl(trimmed, coords), '_blank', 'noopener,noreferrer');
};
