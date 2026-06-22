/** Parse "MM:SS" or "HH:MM:SS" countdown label to seconds. */
export const parseCountdownSeconds = (value?: string): number => {
  if (!value?.trim()) return 0;
  const parts = value.trim().split(':').map((p) => Number.parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
};
