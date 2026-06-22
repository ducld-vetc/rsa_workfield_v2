import {
  ASSIGNMENT_STATUS_LABELS,
  AssignmentStatus,
  DriverRole,
  OrderAssignment,
  OrderStatus,
  RescueOrder,
  STATUS_LABELS,
} from '../types';

export interface HandlerDisplay {
  text: string;
  tone: 'self' | 'peer' | 'pending' | 'muted' | 'none';
}

export interface StatusDisplay {
  label: string;
  variant: 'warning' | 'success' | 'info' | 'neutral' | 'danger';
}

const STATUS_VARIANT: Record<OrderStatus, StatusDisplay['variant']> = {
  'cho-nhan': 'warning',
  'dang-cuu-ho': 'success',
  'hoan-thanh': 'success',
  'tu-choi': 'neutral',
  'huy-don': 'danger',
};

const ASSIGNMENT_VARIANT: Record<AssignmentStatus, StatusDisplay['variant']> = {
  'cho-nhan': 'warning',
  'dang-cuu-ho': 'success',
  'hoan-thanh': 'success',
  'tu-choi': 'neutral',
  'het-han': 'warning',
};

export function getMyAssignment(
  order: RescueOrder,
  currentDriverId: string,
): OrderAssignment | undefined {
  return order.assignments?.find((item) => item.driverId === currentDriverId);
}

function getPendingAcceptAssignment(order: RescueOrder): OrderAssignment | undefined {
  return order.assignments?.find((item) => item.status === 'cho-nhan');
}

function getRejectedAssignmentCount(order: RescueOrder): number {
  return order.assignments?.filter((item) => item.status === 'tu-choi').length ?? 0;
}

function getExpiredAssignmentCount(order: RescueOrder): number {
  return order.assignments?.filter((item) => item.status === 'het-han').length ?? 0;
}

function formatAssignmentIssueSuffix(order: RescueOrder): string {
  const rejectedCount = getRejectedAssignmentCount(order);
  const expiredCount = getExpiredAssignmentCount(order);
  const parts: string[] = [];
  if (rejectedCount > 0) parts.push(`${rejectedCount} từ chối`);
  if (expiredCount > 0) parts.push(`${expiredCount} hết hạn`);
  return parts.join(' · ');
}

function formatPendingAcceptLabel(
  order: RescueOrder,
  pending: OrderAssignment,
  currentDriverId: string,
): string {
  const base =
    pending.driverId === currentDriverId
      ? 'Chờ bạn nhận'
      : `Chờ ${pending.driverName} nhận`;
  const issueSuffix = formatAssignmentIssueSuffix(order);

  if (issueSuffix) {
    return `${base} · ${issueSuffix}`;
  }
  return base;
}

export function isStationManagerView(driverRole: DriverRole): boolean {
  return driverRole === 'quote-rescue';
}

/** Xem danh sách đơn của cả đơn vị (quản lý trạm + chỉ báo giá). */
export function isUnitOrdersView(driverRole: DriverRole): boolean {
  return driverRole === 'quote-rescue' || driverRole === 'quote-only';
}

export function canReassignDriver(driverRole: DriverRole): boolean {
  return driverRole === 'quote-rescue' || driverRole === 'quote-only';
}

export function canReassignOrder(order: RescueOrder): boolean {
  return order.status === 'cho-nhan' || order.status === 'dang-cuu-ho';
}

export function isOrderVisibleInActivity(
  order: RescueOrder,
  driverRole: DriverRole,
  currentDriverId: string,
): boolean {
  if (isUnitOrdersView(driverRole)) return true;
  if (driverRole !== 'rescue-only') return true;

  const mine = getMyAssignment(order, currentDriverId);
  return Boolean(
    mine ||
      order.activeHandlerDriverId === currentDriverId ||
      order.delegatedToDriverId === currentDriverId,
  );
}

export function isMissionOfferedToMe(
  order: RescueOrder,
  currentDriverId: string,
): boolean {
  const mine = getMyAssignment(order, currentDriverId);
  if (mine?.status === 'cho-nhan') return true;
  if (order.delegatedToDriverId === currentDriverId && order.status === 'cho-nhan') {
    return true;
  }
  return (
    order.status === 'cho-nhan' &&
    !order.activeHandlerDriverId &&
    !order.delegatedToDriverId &&
    !order.assignments?.length
  );
}

export function getActivityStatusDisplay(
  order: RescueOrder,
  driverRole: DriverRole,
  currentDriverId: string,
): StatusDisplay {
  if (isUnitOrdersView(driverRole)) {
    return {
      label: STATUS_LABELS[order.status],
      variant: STATUS_VARIANT[order.status],
    };
  }

  const mine = getMyAssignment(order, currentDriverId);
  if (mine) {
    return {
      label: ASSIGNMENT_STATUS_LABELS[mine.status],
      variant: ASSIGNMENT_VARIANT[mine.status],
    };
  }

  return {
    label: STATUS_LABELS[order.status],
    variant: STATUS_VARIANT[order.status],
  };
}

export function getHandlerDisplay(
  order: RescueOrder,
  driverRole: DriverRole,
  currentDriverId: string,
): HandlerDisplay {
  const activeId = order.activeHandlerDriverId ?? order.delegatedToDriverId;
  const activeName =
    order.activeHandlerDriverName ?? order.delegatedToDriverName ?? undefined;
  const mine = getMyAssignment(order, currentDriverId);
  const iAmActive = activeId === currentDriverId;

  if (isUnitOrdersView(driverRole)) {
    if (order.status === 'hoan-thanh') {
      if (iAmActive) return { text: 'Bạn đã hoàn thành', tone: 'self' };
      if (activeName) return { text: `Hoàn thành bởi: ${activeName}`, tone: 'muted' };
    }
    if (iAmActive) {
      return { text: 'Bạn đang xử lý', tone: 'self' };
    }
    if (activeName && order.status === 'dang-cuu-ho') {
      return { text: `Đang xử lý: ${activeName}`, tone: 'peer' };
    }

    const pendingAccept =
      getPendingAcceptAssignment(order) ??
      (order.delegatedToDriverId &&
      order.delegatedToDriverName &&
      order.status === 'cho-nhan'
        ? {
            driverId: order.delegatedToDriverId,
            driverName: order.delegatedToDriverName,
            status: 'cho-nhan' as const,
          }
        : undefined);

    if (pendingAccept && order.status === 'cho-nhan') {
      const isMe = pendingAccept.driverId === currentDriverId;
      return {
        text: formatPendingAcceptLabel(order, pendingAccept, currentDriverId),
        tone: isMe ? 'self' : 'pending',
      };
    }

    if (order.status === 'cho-nhan') {
      const issueSuffix = formatAssignmentIssueSuffix(order);
      if (issueSuffix) {
        return {
          text: `${issueSuffix} · chưa có người nhận`,
          tone: 'pending',
        };
      }
      return { text: 'Chưa có người nhận', tone: 'pending' };
    }
    return { text: '', tone: 'none' };
  }

  if (driverRole === 'rescue-only') {
    if (iAmActive) {
      return { text: 'Bạn đang xử lý', tone: 'self' };
    }
    if (mine?.status === 'tu-choi') {
      const pendingAccept = getPendingAcceptAssignment(order);
      if (pendingAccept && order.status === 'cho-nhan') {
        return {
          text: formatPendingAcceptLabel(order, pendingAccept, currentDriverId),
          tone: 'muted',
        };
      }
      if (activeName && !iAmActive) {
        return { text: `${activeName} đang xử lý đơn này`, tone: 'peer' };
      }
    }
    if (mine?.status === 'het-han') {
      const pendingAccept = getPendingAcceptAssignment(order);
      if (pendingAccept && order.status === 'cho-nhan') {
        return {
          text: formatPendingAcceptLabel(order, pendingAccept, currentDriverId),
          tone: 'muted',
        };
      }
      return { text: 'Bạn không kịp nhận đơn', tone: 'muted' };
    }
    if (mine?.status === 'cho-nhan') {
      return { text: 'Được giao cho bạn', tone: 'pending' };
    }
    if (mine?.status === 'hoan-thanh') {
      return { text: 'Bạn đã hoàn thành', tone: 'muted' };
    }
    if (activeName) {
      return { text: `Đang xử lý: ${activeName}`, tone: 'peer' };
    }
    return { text: '', tone: 'none' };
  }

  return { text: '', tone: 'none' };
}

export function patchAcceptOrder(
  order: RescueOrder,
  currentDriverId: string,
  currentDriverName: string,
): Partial<RescueOrder> {
  const assignments = [...(order.assignments ?? [])];
  const index = assignments.findIndex((item) => item.driverId === currentDriverId);
  const nextAssignment: OrderAssignment = {
    driverId: currentDriverId,
    driverName: currentDriverName,
    status: 'dang-cuu-ho',
    isActive: true,
  };

  if (index >= 0) assignments[index] = nextAssignment;
  else assignments.push(nextAssignment);

  return {
    status: 'dang-cuu-ho',
    jobStage: 'da-nhan',
    activeHandlerDriverId: currentDriverId,
    activeHandlerDriverName: currentDriverName,
    assignments: assignments.map((item) => ({
      ...item,
      isActive: item.driverId === currentDriverId,
    })),
  };
}

export function patchExpireOrder(
  order: RescueOrder,
  currentDriverId: string,
  currentDriverName: string,
): Partial<RescueOrder> {
  const assignments = [...(order.assignments ?? [])];
  const index = assignments.findIndex((item) => item.driverId === currentDriverId);
  const nextAssignment: OrderAssignment = {
    driverId: currentDriverId,
    driverName: currentDriverName,
    status: 'het-han',
    isActive: false,
  };

  if (index >= 0) assignments[index] = nextAssignment;
  else assignments.push(nextAssignment);

  const wasDelegated = order.delegatedToDriverId === currentDriverId;
  const someoneElseActive = Boolean(
    order.activeHandlerDriverId && order.activeHandlerDriverId !== currentDriverId,
  );

  return {
    assignments,
    acceptCountdown: undefined,
    ...(wasDelegated
      ? {
          delegatedToDriverId: undefined,
          delegatedToDriverName: undefined,
          delegatedToDriverPhone: undefined,
          delegatedVehiclePlate: undefined,
        }
      : {}),
    ...(someoneElseActive
      ? {}
      : order.activeHandlerDriverId === currentDriverId
        ? {
            activeHandlerDriverId: undefined,
            activeHandlerDriverName: undefined,
            status: 'cho-nhan' as const,
            jobStage: 'cho-nhan' as const,
          }
        : order.status === 'cho-nhan'
          ? { jobStage: 'cho-nhan' as const }
          : {}),
  };
}

export function patchRejectOrder(
  order: RescueOrder,
  currentDriverId: string,
  currentDriverName: string,
): Partial<RescueOrder> {
  const assignments = [...(order.assignments ?? [])];
  const index = assignments.findIndex((item) => item.driverId === currentDriverId);
  const nextAssignment: OrderAssignment = {
    driverId: currentDriverId,
    driverName: currentDriverName,
    status: 'tu-choi',
    isActive: false,
  };

  if (index >= 0) assignments[index] = nextAssignment;
  else assignments.push(nextAssignment);

  const someoneElseActive = Boolean(
    order.activeHandlerDriverId && order.activeHandlerDriverId !== currentDriverId,
  );

  return {
    assignments,
    ...(someoneElseActive
      ? {}
      : order.activeHandlerDriverId === currentDriverId
        ? {
            activeHandlerDriverId: undefined,
            activeHandlerDriverName: undefined,
            status: 'cho-nhan' as const,
            jobStage: 'cho-nhan' as const,
          }
        : { status: 'cho-nhan' as const, jobStage: 'cho-nhan' as const }),
  };
}

export function patchAssignOrder(
  order: RescueOrder,
  driverId: string,
  driverName: string,
): Partial<RescueOrder> {
  const assignments = [...(order.assignments ?? [])];
  const index = assignments.findIndex((item) => item.driverId === driverId);
  const nextAssignment: OrderAssignment = {
    driverId,
    driverName,
    status: 'cho-nhan',
    isActive: false,
  };

  if (index >= 0) assignments[index] = nextAssignment;
  else assignments.push(nextAssignment);

  return {
    delegatedToDriverId: driverId,
    delegatedToDriverName: driverName,
    assignments,
  };
}

/** Đơn hiển thị trên tab Cứu hộ — chỉ đơn do chính tài xế đang đăng nhập đang xử lý. */
export function getRescueTabActiveJob(
  orders: RescueOrder[],
  _driverRole: DriverRole,
  currentDriverId: string,
): RescueOrder | undefined {
  return orders.find(
    (o) => o.status === 'dang-cuu-ho' && o.activeHandlerDriverId === currentDriverId,
  );
}

export function hasRescueTabLiveJob(
  orders: RescueOrder[],
  driverRole: DriverRole,
  currentDriverId: string,
): boolean {
  return getRescueTabActiveJob(orders, driverRole, currentDriverId) != null;
}

export function isRescueTabHandler(order: RescueOrder, currentDriverId: string): boolean {
  return order.activeHandlerDriverId === currentDriverId;
}

export interface RescueEmptyCopy {
  state: 'not-ready' | 'waiting';
  title: string;
  description: string;
  cta: string;
  action: 'go-online' | 'activity';
}

export function getRescueEmptyCopy(
  _driverRole: DriverRole,
  readyForRescue: boolean,
  pendingCount: number,
): RescueEmptyCopy {
  if (!readyForRescue) {
    return {
      state: 'not-ready',
      title: 'Đang tạm nghỉ',
      description:
        'Bạn đang ở trạng thái không nhận đơn. Hãy bật Sẵn sàng cứu hộ để bắt đầu nhận và thực hiện các đơn cứu hộ.',
      cta: 'Sẵn sàng đi cứu hộ',
      action: 'go-online',
    };
  }

  return {
    state: 'waiting',
    title: 'Sẵn sàng đi cứu hộ',
    description:
      'Đang chờ đơn mới. Bản đồ và tiến trình cứu hộ sẽ hiển thị tại đây khi bạn nhận đơn.',
    cta: pendingCount > 0 ? `Xem ${pendingCount} đơn chờ báo giá` : 'Mở tab Hoạt động',
    action: 'activity',
  };
}
