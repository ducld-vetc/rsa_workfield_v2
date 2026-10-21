import { FilterState, orderKindOf, QuoteOrder, QuoteStatus, RescueOrder } from '../types';

function parseDdMmYyyy(value: string): Date | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getOrderCreatedDate(order: { timestamp: string }): Date | null {
  const match = order.timestamp.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!match) return null;
  return parseDdMmYyyy(`${match[1]}/${match[2]}/${match[3]}`);
}

function normalizePlate(plate: string): string {
  return plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function isFilterActive(filter: FilterState, includeServiceTypes = true): boolean {
  return (
    Boolean(filter.fromDate.trim()) ||
    Boolean(filter.toDate.trim()) ||
    Boolean(filter.plate.trim()) ||
    filter.statuses.length > 0 ||
    (includeServiceTypes && filter.serviceTypes.length > 0) ||
    filter.customerTypes.length > 0 ||
    filter.orderKinds.length > 0 ||
    filter.driverIds.length > 0 ||
    filter.vehiclePlates.length > 0
  );
}

export function countActiveFilterCriteria(
  filter: FilterState,
  includeServiceTypes = true,
): number {
  let count = 0;
  if (filter.fromDate.trim()) count += 1;
  if (filter.toDate.trim()) count += 1;
  if (filter.plate.trim()) count += 1;
  if (filter.statuses.length > 0) count += 1;
  if (includeServiceTypes && filter.serviceTypes.length > 0) count += 1;
  if (filter.customerTypes.length > 0) count += 1;
  if (filter.orderKinds.length > 0) count += 1;
  if (filter.driverIds.length > 0) count += 1;
  if (filter.vehiclePlates.length > 0) count += 1;
  return count;
}

export function matchesOrderFilter(
  order: RescueOrder,
  filter: FilterState,
  options: { includeServiceTypes?: boolean } = {},
): boolean {
  const includeServiceTypes = options.includeServiceTypes ?? true;
  const plateQuery = normalizePlate(filter.plate);
  if (plateQuery && !normalizePlate(order.plate).includes(plateQuery)) {
    return false;
  }

  if (filter.statuses.length > 0 && !filter.statuses.includes(order.status)) {
    return false;
  }

  const orderDate = getOrderCreatedDate(order);
  const fromDate = parseDdMmYyyy(filter.fromDate);
  const toDate = parseDdMmYyyy(filter.toDate);

  if ((filter.fromDate.trim() || filter.toDate.trim()) && !orderDate) {
    return false;
  }

  if (fromDate && orderDate && orderDate < startOfDay(fromDate)) {
    return false;
  }

  if (toDate && orderDate && orderDate > startOfDay(toDate)) {
    return false;
  }

  if (includeServiceTypes && filter.serviceTypes.length > 0) {
    const haystack = [
      order.services,
      ...(order.serviceLines?.map((line) => line.name) ?? []),
    ]
      .join(' ')
      .toLowerCase();

    const matchesService = filter.serviceTypes.some((service) =>
      haystack.includes(service.toLowerCase()),
    );
    if (!matchesService) return false;
  }

  if (filter.customerTypes.length > 0) {
    const kind = order.customerType ?? 'ca-nhan';
    if (!filter.customerTypes.includes(kind)) return false;
  }

  if (filter.orderKinds.length > 0 && !filter.orderKinds.includes(orderKindOf(order))) {
    return false;
  }

  if (filter.driverIds.length > 0) {
    const driverIds = new Set(
      [
        order.activeHandlerDriverId,
        order.delegatedToDriverId,
        ...(order.assignments?.map((item) => item.driverId) ?? []),
      ].filter((id): id is string => Boolean(id)),
    );
    if (!filter.driverIds.some((id) => driverIds.has(id))) return false;
  }

  if (filter.vehiclePlates.length > 0) {
    const vehicle = normalizePlate(order.delegatedVehiclePlate ?? '');
    const selected = filter.vehiclePlates.map(normalizePlate);
    if (!vehicle || !selected.includes(vehicle)) return false;
  }

  return true;
}

function quoteStatusMatches(status: QuoteStatus, selected: string[]): boolean {
  return selected.includes(status);
}

export function filterQuoteOrders(orders: QuoteOrder[], filter: FilterState): QuoteOrder[] {
  if (!isFilterActive(filter, false)) return orders;

  const plateQuery = normalizePlate(filter.plate);
  const fromDate = parseDdMmYyyy(filter.fromDate);
  const toDate = parseDdMmYyyy(filter.toDate);

  return orders.filter((order) => {
    if (plateQuery) {
      const plates = [order.plate, order.rescueVehiclePlate ?? ''].map(normalizePlate);
      if (!plates.some((plate) => plate.includes(plateQuery))) return false;
    }

    if (filter.statuses.length > 0 && !quoteStatusMatches(order.quoteStatus, filter.statuses)) {
      return false;
    }

    const orderDate = getOrderCreatedDate(order);
    if ((filter.fromDate.trim() || filter.toDate.trim()) && !orderDate) return false;
    if (fromDate && orderDate && orderDate < startOfDay(fromDate)) return false;
    if (toDate && orderDate && orderDate > startOfDay(toDate)) return false;
    return true;
  });
}

export function filterOrders(
  orders: RescueOrder[],
  filter: FilterState,
  options?: { includeServiceTypes?: boolean },
): RescueOrder[] {
  if (!isFilterActive(filter, options?.includeServiceTypes ?? true)) {
    return orders;
  }
  return orders.filter((order) => matchesOrderFilter(order, filter, options));
}
