import React from 'react';
import { MOCK_NOTIFICATIONS, MOCK_ORDERS } from '../data/mockOrders';
import { MOCK_QUOTE_ORDERS } from '../data/mockQuoteOrders';
import {
  DriverRole,
  FieldOrderInput,
  FilterState,
  NotificationItem,
  QuoteOrder,
  RescueOrder,
} from '../types';

const EMPTY_FILTER: FilterState = {
  fromDate: '',
  toDate: '',
  plate: '',
  serviceTypes: [],
  statuses: [],
};

import { MOCK_QUOTE_DRIVERS } from '../data/mockQuoteResources';

const DEFAULT_DRIVER = MOCK_QUOTE_DRIVERS[0];

interface AppContextValue {
  orders: RescueOrder[];
  quoteOrders: QuoteOrder[];
  skippedQuoteIds: string[];
  notifications: NotificationItem[];
  readyForRescue: boolean;
  setReadyForRescue: (v: boolean) => void;
  driverRole: DriverRole;
  setDriverRole: (r: DriverRole) => void;
  currentDriverId: string;
  currentDriverName: string;
  setCurrentDriverId: (id: string) => void;
  demoHasOrders: boolean;
  setDemoHasOrders: (v: boolean) => void;
  updateOrder: (id: string, patch: Partial<RescueOrder>) => void;
  updateQuoteOrder: (id: string, patch: Partial<QuoteOrder>) => void;
  getOrder: (id: string) => RescueOrder | undefined;
  getQuoteOrder: (id: string) => QuoteOrder | undefined;
  submitQuote: (id: string, data: Partial<QuoteOrder>) => void;
  skipQuote: (id: string) => void;
  createFieldOrder: (input: FieldOrderInput) => { id: string; started: boolean };
  appliedFilter: FilterState;
  setAppliedFilter: (f: FilterState) => void;
  appliedQuoteFilter: FilterState;
  setAppliedQuoteFilter: (f: FilterState) => void;
  emptyFilter: FilterState;
}

const AppContext = React.createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = React.useState<RescueOrder[]>(MOCK_ORDERS);
  const [quoteOrders, setQuoteOrders] = React.useState<QuoteOrder[]>(MOCK_QUOTE_ORDERS);
  const [skippedQuoteIds, setSkippedQuoteIds] = React.useState<string[]>([]);
  const [notifications] = React.useState(MOCK_NOTIFICATIONS);
  const [readyForRescue, setReadyForRescue] = React.useState(true);
  const [driverRole, setDriverRole] = React.useState<DriverRole>('quote-rescue');
  const [currentDriverId, setCurrentDriverId] = React.useState(DEFAULT_DRIVER.id);
  const [demoHasOrders, setDemoHasOrders] = React.useState(true);
  const [appliedFilter, setAppliedFilter] = React.useState<FilterState>(EMPTY_FILTER);
  const [appliedQuoteFilter, setAppliedQuoteFilter] = React.useState<FilterState>(EMPTY_FILTER);

  const updateOrder = (id: string, patch: Partial<RescueOrder>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: Date.now() } : o)),
    );
  };

  const updateQuoteOrder = (id: string, patch: Partial<QuoteOrder>) => {
    setQuoteOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: Date.now() } : o)),
    );
  };

  const getOrder = (id: string) => orders.find((o) => o.id === id);
  const getQuoteOrder = (id: string) => quoteOrders.find((o) => o.id === id);
  const currentDriverName =
    MOCK_QUOTE_DRIVERS.find((driver) => driver.id === currentDriverId)?.name ??
    DEFAULT_DRIVER.name;

  const handleSetCurrentDriverId = (id: string) => {
    setCurrentDriverId(id);
  };

  const skipQuote = (id: string) => {
    setSkippedQuoteIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const createFieldOrder = (input: FieldOrderInput) => {
    const now = new Date();
    const id = `field-${now.getTime()}`;
    const hasLiveJob = orders.some(
      (order) =>
        order.status === 'dang-cuu-ho' && order.activeHandlerDriverId === currentDriverId,
    );
    const handlerId = input.rescueDriverId || currentDriverId;
    const handlerName = input.rescueDriverName || currentDriverName;
    const assignedToMe = handlerId === currentDriverId;
    const started = driverRole !== 'quote-only' && assignedToMe && !hasLiveJob;
    const serviceNames =
      input.services && input.services.length > 0
        ? input.services
        : [input.serviceMode === 'Cẩu kéo' ? 'Kéo xe' : 'Hỗ trợ tại chỗ'];
    const services = serviceNames.join('; ');
    const stamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00, ${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const order: RescueOrder = {
      id,
      orderCode: `WF-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getTime()).slice(-4)}`,
      plate: input.plate.trim().toUpperCase(),
      brand: input.brand.trim() || 'Chưa rõ',
      model: input.model.trim() || 'Chưa rõ',
      address: input.address.trim(),
      towDestination: input.towDestination?.trim() || undefined,
      pickupCoords: input.pickupCoords,
      towCoords: input.towCoords,
      timestamp: stamp,
      updatedAt: now.getTime(),
      services,
      serviceLines: serviceNames.map((name) => ({
        name,
        value: /kéo/i.test(name) ? 'Theo điểm kéo' : '1 lần',
      })),
      status: started ? 'dang-cuu-ho' : 'cho-nhan',
      jobStage: started ? 'da-nhan' : 'cho-nhan',
      monthGroup: `Tháng ${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`,
      condition: input.condition.trim() || serviceNames[0],
      conditionDescription: [input.locationType, input.condition.trim()]
        .filter(Boolean)
        .join(' · ') || undefined,
      incidentPhotos: input.incidentPhotos,
      customerName: input.customerName.trim() || undefined,
      customerPhone: input.customerPhone.trim() || undefined,
      estimatedTotal: input.estimatedTotal,
      priceConfirmed: input.estimatedTotal != null,
      orderLine: input.orderLine ?? 'cuu-ho',
      rescueChannel: input.orderLine === 'van-tai' ? undefined : 'noi-bo',
      delegatedToDriverId: input.rescueDriverId,
      delegatedToDriverName: input.rescueDriverName,
      delegatedVehiclePlate: input.rescueVehiclePlate,
      activeHandlerDriverId: started ? handlerId : undefined,
      activeHandlerDriverName: started ? handlerName : undefined,
      assignments: [
        {
          driverId: handlerId,
          driverName: handlerName,
          status: started ? 'dang-cuu-ho' : 'cho-nhan',
          isActive: started,
        },
      ],
    };

    setOrders((prev) => [order, ...prev]);
    return { id, started };
  };

  const submitQuote = (id: string, data: Partial<QuoteOrder>) => {
    const quote = quoteOrders.find((o) => o.id === id);
    if (!quote) return;

    updateQuoteOrder(id, {
      ...data,
      quoteStatus: 'da-bao-gia',
    });

    if (driverRole !== 'quote-only') {
      const rescueId = `r-${id}`;
      const exists = orders.some((o) => o.id === rescueId);
      if (!exists) {
        setOrders((prev) => [
          {
            id: rescueId,
            orderCode: quote.orderCode,
            plate: quote.plate.replace(/\./g, '-'),
            brand: quote.brand,
            model: quote.model,
            address: quote.address,
            towDestination: quote.towDestination,
            timestamp: quote.timestamp,
            updatedAt: Date.now(),
            services: quote.serviceName,
            status: 'cho-nhan',
            jobStage: 'cho-nhan',
            monthGroup: 'Tháng 03/2026',
            distanceKm: quote.distanceKm,
            etaMinutes: data.quotedEtaMinutes ?? 30,
            estimatedTotal: data.quotedPrice,
            priceConfirmed: true,
            quoteOrderId: id,
            acceptCountdown: '10:00',
            condition: quote.serviceMode,
            respondBy: 'Trong 30 phút',
          },
          ...prev,
        ]);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        orders,
        quoteOrders,
        skippedQuoteIds,
        notifications,
        readyForRescue,
        setReadyForRescue,
        driverRole,
        setDriverRole,
        currentDriverId,
        currentDriverName,
        setCurrentDriverId: handleSetCurrentDriverId,
        demoHasOrders,
        setDemoHasOrders,
        updateOrder,
        updateQuoteOrder,
        getOrder,
        getQuoteOrder,
        submitQuote,
        skipQuote,
        createFieldOrder,
        appliedFilter,
        setAppliedFilter,
        appliedQuoteFilter,
        setAppliedQuoteFilter,
        emptyFilter: EMPTY_FILTER,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
