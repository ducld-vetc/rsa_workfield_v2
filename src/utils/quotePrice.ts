import { QuoteOrder, isTowQuote } from '../types';

const BASE_FEE = 150_000;
const PER_KM_TO_INCIDENT = 25_000;
const PER_KM_TOW = 35_000;

export const suggestQuotePrice = (order: QuoteOrder): number => {
  let total = BASE_FEE + order.distanceKm * PER_KM_TO_INCIDENT;
  if (isTowQuote(order) && order.towKm != null) {
    total += order.towKm * PER_KM_TOW;
  }
  return Math.round(total / 1000) * 1000;
};

export const formatVndInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('vi-VN');
};

export const parseVndInput = (formatted: string): number =>
  Number(formatted.replace(/\D/g, '')) || 0;
