import React from 'react';
import { Plus, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  DlsBrandButton,
  DlsHomeIndicator,
  DlsNeutralButton,
  DlsSearchField,
  DlsSelectField,
  DlsSheetHeader,
  DlsTextField,
  DlsTopNav,
  FilterIcon,
} from '@dls/components';
import { ConfirmDialog } from '../components/DetailRow';
import MainShell from '../layouts/MainShell';
import StaffFilterSheet, {
  countStaffFilterCriteria,
  EMPTY_STAFF_FILTER,
  isStaffFilterActive,
  StaffFilterState,
} from '../components/StaffFilterSheet';
import StaffSwipeRow from '../components/StaffSwipeRow';
import StaffOtpSheet from '../components/StaffOtpSheet';
import {
  generateStaffUsername,
  isStaffPhoneTaken,
  readStaffMembers,
  STAFF_ROLE_OPTIONS,
  StaffMember,
  writeStaffMembers,
} from '../utils/staff';
import { clearStaffOtpSession } from '../utils/staffOtp';

interface StaffFormState {
  fullName: string;
  phone: string;
  role: string;
}

const EMPTY_FORM: StaffFormState = {
  fullName: '',
  phone: '',
  role: '',
};

const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const StaffManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [staff, setStaff] = React.useState<StaffMember[]>(() => readStaffMembers());
  const [form, setForm] = React.useState<StaffFormState>(EMPTY_FORM);
  const [formOpen, setFormOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [filterDraft, setFilterDraft] = React.useState<StaffFilterState>(EMPTY_STAFF_FILTER);
  const [appliedFilter, setAppliedFilter] = React.useState<StaffFilterState>(EMPTY_STAFF_FILTER);
  const [openSwipeId, setOpenSwipeId] = React.useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<StaffMember | null>(null);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [createSuccessOpen, setCreateSuccessOpen] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [pendingCreate, setPendingCreate] = React.useState<StaffFormState | null>(null);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setFormOpen(false);
    setFormError(null);
    setPendingCreate(null);
    setOtpOpen(false);
    clearStaffOtpSession();
  };

  const isPhoneValid = /^\d{10,11}$/.test(form.phone.trim());
  const isFormValid =
    form.fullName.trim().length >= 2 && isPhoneValid && form.role.trim().length >= 2;

  const filterActive = isStaffFilterActive(appliedFilter);
  const activeFilterCount = countStaffFilterCriteria(appliedFilter);

  const filteredStaff = React.useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return staff.filter((member) => {
      if (keyword) {
        const haystack = `${member.fullName} ${member.phone} ${member.username} ${member.role}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      if (appliedFilter.roles.length > 0 && !appliedFilter.roles.includes(member.role)) return false;
      if (appliedFilter.statuses.length > 0 && !appliedFilter.statuses.includes(member.status)) {
        return false;
      }
      return true;
    });
  }, [staff, searchQuery, appliedFilter]);

  const createStaffMember = (payload: StaffFormState) => {
    const normalizedName = payload.fullName.trim();
    const normalizedPhone = payload.phone.trim();
    const normalizedRole = payload.role.trim();
    const created: StaffMember = {
      id: `ns-${Date.now()}`,
      fullName: normalizedName,
      phone: normalizedPhone,
      username: generateStaffUsername(normalizedName, normalizedPhone),
      role: normalizedRole,
      status: 'active',
    };
    const updated = [created, ...staff];
    setStaff(updated);
    writeStaffMembers(updated);
    resetForm();
    setCreateSuccessOpen(true);
  };

  const handleSubmit = () => {
    if (!isFormValid) return;
    const normalizedPhone = form.phone.trim();
    if (isStaffPhoneTaken(normalizedPhone, staff)) {
      setFormError('Số điện thoại đã được dùng bởi nhân sự khác.');
      return;
    }
    setFormError(null);
    setPendingCreate({
      fullName: form.fullName.trim(),
      phone: normalizedPhone,
      role: form.role.trim(),
    });
    setFormOpen(false);
    setOtpOpen(true);
  };

  const handleCreate = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const updated = staff.filter((item) => item.id !== pendingDelete.id);
    setStaff(updated);
    writeStaffMembers(updated);
    setOpenSwipeId(null);
    setPendingDelete(null);
  };

  return (
    <MainShell>
      <div className="grab-staff-page grab-staff-page--directory">
        <div className="grab-staff-hero">
          <DlsTopNav
            title="Quản lý nhân sự"
            variant="default"
            onBack={() => navigate('/settings')}
          />
        </div>

        <div className="grab-staff-sheet">
          <div className="grab-staff-sheet__toolbar">
            <DlsSearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm theo tên, SĐT, username..."
            />
            <button
              type="button"
              className={`grab-staff-filter-btn${filterActive ? ' grab-staff-filter-btn--active' : ''}`}
              onClick={() => {
                setFilterDraft(appliedFilter);
                setFilterOpen(true);
              }}
              aria-label="Lọc nhân sự"
            >
              <FilterIcon />
              {filterActive && (
                <span className="grab-staff-filter-btn__badge" aria-hidden>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {filterActive && (
            <div className="grab-staff-filter-bar">
              <p className="grab-staff-filter-bar__summary">
                Đang lọc theo {activeFilterCount} tiêu chí · {filteredStaff.length} kết quả
              </p>
              <button
                type="button"
                className="grab-staff-filter-bar__clear"
                onClick={() => setAppliedFilter(EMPTY_STAFF_FILTER)}
              >
                Xoá lọc
              </button>
            </div>
          )}

          <div className="grab-staff-sheet__body">
            {staff.length === 0 ? (
              <div className="grab-staff-empty">
                <UserRound size={28} />
                <p>Chưa có nhân sự nào. Hãy tạo mới để bắt đầu.</p>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="grab-staff-empty">
                <UserRound size={28} />
                <p>Không tìm thấy nhân sự phù hợp.</p>
              </div>
            ) : (
              <div className="grab-staff-list grab-staff-list--directory">
                {filteredStaff.map((member) => (
                  <StaffSwipeRow
                    key={member.id}
                    member={member}
                    initials={getInitials(member.fullName)}
                    open={openSwipeId === member.id}
                    onOpenChange={(nextOpen) => setOpenSwipeId(nextOpen ? member.id : null)}
                    onOpenDetail={() => navigate(`/settings/staff/${member.id}`)}
                    onDelete={() => setPendingDelete(member)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grab-staff-sheet__footer">
            <DlsBrandButton onClick={handleCreate}>
              <span className="grab-staff-sheet__footer-label">
                <Plus size={18} />
                Thêm nhân sự
              </span>
            </DlsBrandButton>
          </div>
        </div>
      </div>

      {formOpen && (
        <div
          className="dls-sheet-overlay"
          role="dialog"
          aria-modal
          aria-label="Thêm nhân sự mới"
          onClick={resetForm}
        >
          <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
            <DlsSheetHeader title="Thêm nhân sự mới" onClose={resetForm} />
            <div className="dls-sheet-body dls-sheet-body--form">
              <DlsTextField
                label="Họ và tên"
                value={form.fullName}
                onChange={(value) => setForm((prev) => ({ ...prev, fullName: value }))}
                placeholder="Nhập họ tên"
                required
              />
              <DlsTextField
                label="Số điện thoại"
                value={form.phone}
                onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                placeholder="Nhập số điện thoại"
                required
                error={form.phone.length > 0 && !isPhoneValid ? 'Số điện thoại 10-11 chữ số' : ''}
              />
              <DlsSelectField
                label="Vai trò"
                value={form.role}
                options={STAFF_ROLE_OPTIONS}
                onChange={(role) => setForm((prev) => ({ ...prev, role }))}
                placeholder="Chọn vai trò"
                sheetTitle="Chọn vai trò"
                required
              />
              {formError && (
                <p className="dls-field-error" role="alert">
                  {formError}
                </p>
              )}
              <p className="grab-staff-otp-note">
                Hệ thống sẽ gửi OTP tới số điện thoại để xác nhận trước khi tạo tài khoản.
              </p>
            </div>
            <div className="dls-sheet-footer">
              <DlsNeutralButton onClick={resetForm}>Huỷ</DlsNeutralButton>
              <DlsBrandButton onClick={handleSubmit} disabled={!isFormValid}>
                Gửi OTP
              </DlsBrandButton>
            </div>
            <DlsHomeIndicator />
          </div>
        </div>
      )}

      <StaffFilterSheet
        open={filterOpen}
        value={filterDraft}
        onChange={setFilterDraft}
        onClose={() => setFilterOpen(false)}
        onApply={() => {
          setAppliedFilter(filterDraft);
          setFilterOpen(false);
        }}
        onClear={() => {
          setFilterDraft(EMPTY_STAFF_FILTER);
          setAppliedFilter(EMPTY_STAFF_FILTER);
          setFilterOpen(false);
        }}
      />

      <StaffOtpSheet
        open={otpOpen}
        phone={pendingCreate?.phone ?? ''}
        purpose="create-staff"
        title="Xác thực OTP tạo nhân sự"
        onClose={() => {
          setOtpOpen(false);
          clearStaffOtpSession();
          setFormOpen(true);
        }}
        onVerified={() => {
          if (!pendingCreate) return;
          setOtpOpen(false);
          clearStaffOtpSession();
          createStaffMember(pendingCreate);
        }}
      />

      <ConfirmDialog
        open={createSuccessOpen}
        title="Đã tạo nhân sự"
        message={
          'Đăng ký tài khoản thành công. Tên đăng nhập và mật khẩu truy cập đã được gửi qua tin nhắn đến số điện thoại của người dùng.\nVui lòng kiểm tra tin nhắn điện thoại để đăng nhập.'
        }
        confirmLabel="Đã hiểu"
        cancelLabel=""
        onConfirm={() => setCreateSuccessOpen(false)}
        onCancel={() => setCreateSuccessOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xoá nhân sự"
        message={`Bạn có chắc muốn xoá ${pendingDelete?.fullName ?? 'nhân sự này'}?`}
        confirmLabel="Xoá"
        cancelLabel="Huỷ"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      <DlsHomeIndicator />
    </MainShell>
  );
};

export default StaffManagementPage;
