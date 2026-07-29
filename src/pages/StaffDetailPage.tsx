import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DlsBrandButton,
  DlsHomeIndicator,
  DlsLabel,
  DlsNeutralButton,
  DlsSelectField,
  DlsTextField,
  DlsToggle,
  DlsTopNav,
} from '@dls/components';
import { ConfirmDialog } from '../components/DetailRow';
import StaffOtpSheet from '../components/StaffOtpSheet';
import MainShell from '../layouts/MainShell';
import {
  isStaffPhoneTaken,
  readStaffMembers,
  STAFF_ROLE_OPTIONS,
  StaffMember,
  StaffStatus,
  writeStaffMembers,
} from '../utils/staff';
import { clearStaffOtpSession } from '../utils/staffOtp';

interface StaffFormState {
  fullName: string;
  phone: string;
  role: string;
  status: StaffStatus;
}

const StaffDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [members, setMembers] = React.useState<StaffMember[]>(() => readStaffMembers());
  const member = React.useMemo(() => members.find((item) => item.id === id) ?? null, [id, members]);
  const [form, setForm] = React.useState<StaffFormState>({
    fullName: '',
    phone: '',
    role: '',
    status: 'active',
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [otpOpen, setOtpOpen] = React.useState(false);
  const [resetOpen, setResetOpen] = React.useState(false);
  const [resetSuccessOpen, setResetSuccessOpen] = React.useState(false);

  React.useEffect(() => {
    if (!member) return;
    setForm({
      fullName: member.fullName,
      phone: member.phone,
      role: member.role,
      status: member.status,
    });
  }, [member]);

  const isPhoneValid = /^\d{10,11}$/.test(form.phone.trim());
  const isFormValid =
    form.fullName.trim().length >= 2 && isPhoneValid && form.role.trim().length >= 2;
  const phoneChanged =
    Boolean(member) && form.phone.trim().replace(/\D/g, '') !== (member?.phone.replace(/\D/g, '') ?? '');

  const persistChanges = (payload: StaffFormState) => {
    if (!member) return;
    const updated = members.map((item) =>
      item.id === member.id
        ? {
            ...item,
            fullName: payload.fullName.trim(),
            phone: payload.phone.trim(),
            role: payload.role.trim(),
            status: payload.status,
          }
        : item,
    );
    setMembers(updated);
    writeStaffMembers(updated);
    clearStaffOtpSession();
    navigate('/settings/staff');
  };

  const handleSave = () => {
    if (!member || !isFormValid) return;
    const normalizedPhone = form.phone.trim();
    if (isStaffPhoneTaken(normalizedPhone, members, member.id)) {
      setFormError('Số điện thoại đã được dùng bởi nhân sự khác.');
      return;
    }
    setFormError(null);

    if (phoneChanged) {
      setOtpOpen(true);
      return;
    }

    persistChanges(form);
  };

  return (
    <MainShell>
      <div className="grab-staff-page">
        <DlsTopNav title="Chi tiết nhân sự" onBack={() => navigate('/settings/staff')} />

        {!member ? (
          <div className="grab-staff-empty">
            <p>Không tìm thấy nhân sự.</p>
          </div>
        ) : (
          <section className="grab-staff-form-card">
            <div className="grab-staff-detail-status">
              <div className="grab-staff-detail-status__copy">
                <span className="grab-staff-detail-status__label">Trạng thái</span>
                <strong>
                  {form.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                </strong>
              </div>
              <DlsToggle
                on={form.status === 'active'}
                onChange={(active) =>
                  setForm((prev) => ({ ...prev, status: active ? 'active' : 'paused' }))
                }
              />
            </div>

            <div className="grab-staff-form-grid">
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
                onChange={(value) => {
                  setFormError(null);
                  setForm((prev) => ({ ...prev, phone: value }));
                }}
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
              <div className="dls-field">
                <DlsLabel>Username</DlsLabel>
                <div className="dls-input-wrap dls-input-wrap--disabled">
                  <input className="dls-input" value={member.username} disabled readOnly />
                </div>
              </div>
            </div>
            <p className="grab-staff-username-note">Username dùng để đăng nhập của nhân sự.</p>
            {phoneChanged && (
              <p className="grab-staff-otp-note">
                Đổi số điện thoại sẽ yêu cầu xác thực OTP gửi tới số mới trước khi lưu.
              </p>
            )}
            {formError && (
              <p className="dls-field-error" role="alert">
                {formError}
              </p>
            )}

            <div className="grab-staff-form-actions">
              <DlsNeutralButton onClick={() => setResetOpen(true)} fullWidth={false}>
                Reset mật khẩu
              </DlsNeutralButton>
              <DlsBrandButton onClick={handleSave} disabled={!isFormValid} fullWidth={false}>
                {phoneChanged ? 'Gửi OTP & lưu' : 'Lưu thay đổi'}
              </DlsBrandButton>
            </div>
          </section>
        )}
      </div>

      <StaffOtpSheet
        open={otpOpen}
        phone={form.phone}
        purpose="change-phone"
        title="Xác thực OTP đổi SĐT"
        onClose={() => {
          setOtpOpen(false);
          clearStaffOtpSession();
        }}
        onVerified={() => {
          setOtpOpen(false);
          persistChanges(form);
        }}
      />

      <ConfirmDialog
        open={resetOpen}
        title="Reset mật khẩu"
        message={`Xác nhận reset mật khẩu cho @${member?.username ?? ''}?`}
        confirmLabel="Reset"
        cancelLabel="Huỷ"
        onConfirm={() => {
          setResetOpen(false);
          setResetSuccessOpen(true);
        }}
        onCancel={() => setResetOpen(false)}
      />

      <ConfirmDialog
        open={resetSuccessOpen}
        title="Đã reset mật khẩu"
        message={`Mật khẩu mới tạm thời sẽ được gửi qua số điện thoại ${member?.phone ?? ''} của nhân sự.`}
        confirmLabel="Đã hiểu"
        cancelLabel=""
        onConfirm={() => setResetSuccessOpen(false)}
        onCancel={() => setResetSuccessOpen(false)}
      />

      <DlsHomeIndicator />
    </MainShell>
  );
};

export default StaffDetailPage;
