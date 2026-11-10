import {
  ASSIGNMENT_STATUS_LABELS,
  DispatchLogEntry,
  DispatchLogKind,
  QuoteOrder,
  RescueOrder,
} from '../types';

export const DISPATCH_KIND_LABEL: Record<DispatchLogKind, string> = {
  quote: 'Báo giá',
  'quote-reject': 'Từ chối báo giá',
  assign: 'Phân công',
  accept: 'Nhận đơn',
  reject: 'Từ chối đơn',
  expire: 'Hết hạn',
  transfer: 'Điều chuyển',
};

export function isDispatchPhase(kind: DispatchLogKind): boolean {
  return kind === 'quote' || kind === 'quote-reject';
}

function quoteRank(entry: DispatchLogEntry): number {
  if (entry.kind === 'expire') return 3;
  if (entry.kind === 'quote-reject' || entry.kind === 'reject') return 2;
  if (entry.selected) return 0;
  return 1;
}

function executionRank(entry: DispatchLogEntry): number {
  if (entry.kind === 'expire') return 3;
  if (entry.kind === 'reject') return 2;
  if (entry.kind === 'assign') return 0;
  return 1;
}

export function sortDispatchEntries(
  entries: DispatchLogEntry[],
  phase: 'quote' | 'execution',
): DispatchLogEntry[] {
  const rank = phase === 'quote' ? quoteRank : executionRank;
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => rank(a.entry) - rank(b.entry) || a.index - b.index)
    .map((item) => item.entry);
}

function formatMoney(amount: number): string {
  return `${amount.toLocaleString('vi-VN')} đ`;
}

export function dispatchLogOf(order: RescueOrder, quote?: QuoteOrder): DispatchLogEntry[] {
  if (order.dispatchLog?.length) return order.dispatchLog;

  const entries: DispatchLogEntry[] = [];
  const price = quote?.quotedPrice ?? order.estimatedTotal;
  const vehicle = quote?.rescueVehiclePlate ?? order.delegatedVehiclePlate;
  if (quote?.rescueStationName || price != null || vehicle) {
    entries.push({
      id: `${order.id}-quote`,
      at: quote?.timestamp ?? '',
      kind: 'quote',
      actor: quote?.rescueStationName ?? 'Đơn vị báo giá',
      price: price != null ? formatMoney(price) : undefined,
      driverName: quote?.quotedDriverName,
      vehiclePlate: vehicle,
      selected: true,
    });
  }

  for (const item of order.assignments ?? []) {
    const kind: DispatchLogKind =
      item.status === 'tu-choi'
        ? 'reject'
        : item.status === 'het-han'
          ? 'expire'
          : item.status === 'dang-cuu-ho' || item.status === 'hoan-thanh'
            ? 'accept'
            : 'assign';
    entries.push({
      id: `${order.id}-${item.driverId}-${item.status}`,
      at: '',
      kind,
      actor: item.driverName,
      note: ASSIGNMENT_STATUS_LABELS[item.status],
      vehiclePlate: order.delegatedVehiclePlate,
    });
  }

  if (order.assignChangeReason) {
    entries.push({
      id: `${order.id}-transfer`,
      at: '',
      kind: 'transfer',
      actor: order.assignChangeReason,
    });
  }

  return entries;
}
