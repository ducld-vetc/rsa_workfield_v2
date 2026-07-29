export type StaffStatus = 'active' | 'paused';

export interface StaffMember {
  id: string;
  fullName: string;
  phone: string;
  username: string;
  role: string;
  status: StaffStatus;
}

const STAFF_STORAGE_KEY = 'rsa-driver-staff-members-v2';

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'ns-01',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    username: 'an.nguyen',
    role: 'Tài xế cứu hộ',
    status: 'active',
  },
  {
    id: 'ns-02',
    fullName: 'Trần Minh Khoa',
    phone: '0912345678',
    username: 'khoa.tran',
    role: 'Điều phối viên',
    status: 'active',
  },
  {
    id: 'ns-03',
    fullName: 'Lê Thị Mai',
    phone: '0934567890',
    username: 'mai.le',
    role: 'Quản trị viên',
    status: 'active',
  },
  {
    id: 'ns-04',
    fullName: 'Phạm Quốc Bảo',
    phone: '0978123456',
    username: 'bao.pham',
    role: 'Tài xế cứu hộ',
    status: 'paused',
  },
  {
    id: 'ns-05',
    fullName: 'Hoàng Thu Hà',
    phone: '0987654321',
    username: 'ha.hoang',
    role: 'Điều phối viên',
    status: 'paused',
  },
];

const ACCENTED_NAME_BY_PLAIN: Record<string, string> = {
  'nguyen van an': 'Nguyễn Văn An',
  'tran minh khoa': 'Trần Minh Khoa',
  'le thi mai': 'Lê Thị Mai',
  'pham quoc bao': 'Phạm Quốc Bảo',
  'hoang thu ha': 'Hoàng Thu Hà',
};

const withVietnameseName = (fullName: string): string => {
  const mapped = ACCENTED_NAME_BY_PLAIN[fullName.trim().toLowerCase()];
  return mapped ?? fullName;
};

export const STAFF_ROLE_OPTIONS = ['Tài xế cứu hộ', 'Điều phối viên', 'Quản trị viên'];

const normalizeUsername = (raw: string): string =>
  raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 24);

export const generateStaffUsername = (fullName: string, phone: string): string => {
  const base = normalizeUsername(fullName);
  const suffix = phone.replace(/\D/g, '').slice(-4);
  const fallback = suffix ? `user.${suffix}` : `user.${Date.now().toString().slice(-4)}`;
  if (!base) return fallback;
  return suffix ? `${base}.${suffix}` : base;
};

export const readStaffMembers = (): StaffMember[] => {
  if (typeof window === 'undefined') return INITIAL_STAFF;
  const raw = window.localStorage.getItem(STAFF_STORAGE_KEY);
  if (!raw) return INITIAL_STAFF;
  try {
    const parsed = JSON.parse(raw) as Array<Partial<StaffMember>>;
    if (!Array.isArray(parsed)) return INITIAL_STAFF;
    return parsed.map((member) => {
      const fullName = withVietnameseName(String(member.fullName ?? '').trim());
      const phone = String(member.phone ?? '').trim();
      return {
        id: String(member.id ?? `ns-${Date.now()}`),
        fullName,
        phone,
        username: String(member.username ?? generateStaffUsername(fullName, phone)),
        role: String(member.role ?? ''),
        status: member.status === 'paused' ? 'paused' : 'active',
      };
    });
  } catch {
    return INITIAL_STAFF;
  }
};

export const writeStaffMembers = (members: StaffMember[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(members));
};

export const isStaffPhoneTaken = (
  phone: string,
  members: StaffMember[],
  excludeId?: string,
): boolean => {
  const normalized = phone.replace(/\D/g, '');
  return members.some(
    (member) => member.id !== excludeId && member.phone.replace(/\D/g, '') === normalized,
  );
};
