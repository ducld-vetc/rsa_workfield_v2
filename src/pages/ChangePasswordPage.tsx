import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/DetailRow';
import { DlsBrandButton, DlsHomeIndicator, DlsTextField, DlsTopNav } from '@dls/components';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const valid = current && password.length >= 6 && password === confirm;

  return (
    <div className="dm-screen">
      <DlsTopNav title="Đổi mật khẩu" onBack={() => navigate('/settings')} />
      <div className="dls-auth-body">
        <DlsTextField
          label="Mật khẩu hiện tại"
          type="password"
          value={current}
          onChange={setCurrent}
          required
        />
        <DlsTextField
          label="Mật khẩu mới"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
        <DlsTextField
          label="Xác nhận mật khẩu"
          type="password"
          value={confirm}
          onChange={setConfirm}
          required
        />
        <DlsBrandButton onClick={() => setSuccess(true)} disabled={!valid}>
          Lưu
        </DlsBrandButton>
      </div>
      <ConfirmDialog
        open={success}
        title="Thành công"
        message="Mật khẩu đã được thay đổi."
        confirmLabel="OK"
        cancelLabel=""
        onConfirm={() => navigate('/settings')}
        onCancel={() => navigate('/settings')}
      />
      <DlsHomeIndicator />
    </div>
  );
};

export default ChangePasswordPage;
