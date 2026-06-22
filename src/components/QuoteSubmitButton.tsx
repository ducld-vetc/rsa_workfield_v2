import React from 'react';
import ProgressCountdownButton from './ProgressCountdownButton';

interface QuoteSubmitButtonProps {
  initialSeconds?: number;
  disabled?: boolean;
  onClick: () => void;
  onExpire?: () => void;
  onExtend?: () => void;
  canExtend?: boolean;
  label?: string;
}

const QuoteSubmitButton: React.FC<QuoteSubmitButtonProps> = ({
  initialSeconds = 0,
  disabled = false,
  onClick,
  onExpire,
  onExtend,
  canExtend = false,
  label = 'Gửi báo giá',
}) => (
  <ProgressCountdownButton
    label={label}
    initialSeconds={initialSeconds}
    disabled={disabled}
    onClick={onClick}
    onExpire={onExpire}
    expireDialog={{
      title: 'Hết thời gian báo giá',
      message:
        canExtend && onExtend
          ? 'Thời gian báo giá đã hết. Bạn có thể gia hạn thêm 1 phút hoặc bỏ qua đơn này.'
          : 'Thời gian báo giá đã hết. Bạn không thể gửi báo giá cho đơn này.',
      confirmLabel: canExtend && onExtend ? 'Gia hạn 1 phút' : 'Đã hiểu',
      cancelLabel: canExtend && onExtend ? 'Đóng' : '',
      onConfirm: canExtend && onExtend ? onExtend : undefined,
    }}
  />
);

export default QuoteSubmitButton;
