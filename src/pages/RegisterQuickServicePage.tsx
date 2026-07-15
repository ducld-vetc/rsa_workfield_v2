import React from 'react';
import {
  Camera,
  Check,
  ChevronRight,
  FileText,
  IdCard,
  MapPin,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StationMapPicker from '../components/StationMapPicker';
import {
  DlsBrandButton,
  DlsCheckbox,
  DlsDetailRow,
  DlsHomeIndicator,
  DlsLabel,
  DlsSheetHandle,
  DlsTextField,
  DlsTopNav,
} from '@dls/components';
import { GeoPoint } from '../types';
import { EMPTY_MAP_CENTER } from '../utils/orderMap';
import {
  clearRegisterOtpSession,
  isRegisterOtpExpired,
  isValidRegisterPhone,
  maskRegisterPhone,
  readRegisterOtpSession,
  REGISTER_OTP_RESEND_SEC,
  resendRegisterOtp,
  startRegisterOtp,
  verifyRegisterOtp,
} from '../utils/registerQuickService';

type Phase = 'phone' | 'otp' | 'owner' | 'station' | 'summary' | 'done';

const STATION_SERVICES = [
  'Kéo xe cứu hộ',
  'Cẩu xe',
  'Kích bình / ắc quy',
  'Thay lốp',
  'Vá lốp tại chỗ',
  'Bơm lốp',
  'Đổ xăng / nhiên liệu',
  'Mở khóa cửa xe',
  'Hỗ trợ thủy kích',
  'Sửa chữa điện',
  'Sửa chữa động cơ tại chỗ',
  'Đưa đón khách hàng',
  'Thay dầu động cơ',
  'Kiểm tra / chẩn đoán lỗi',
  'Hỗ trợ ắc quy lưu động',
  'Rửa xe nhanh',
] as const;

const DEMO_ADDRESSES = [
  '12 Nguyễn Văn Linh, P. Tân Phú, Q.7, TP.HCM',
  '45 Lê Văn Việt, P. Hiệp Phú, TP. Thủ Đức, TP.HCM',
  '88 Nguyễn Trãi, P. Bến Thành, Q.1, TP.HCM',
  '21 Phạm Văn Đồng, P. Mai Dịch, Q. Cầu Giấy, Hà Nội',
  '6 Trần Duy Hưng, P. Trung Hòa, Q. Cầu Giấy, Hà Nội',
];

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidCccd(value: string): boolean {
  return /^\d{9}$|^\d{12}$/.test(value.replace(/\s/g, ''));
}

function addressFromPoint(point: GeoPoint): string {
  const idx = Math.abs(Math.round(point.lat * 1000 + point.lng * 1000)) % DEMO_ADDRESSES.length;
  return DEMO_ADDRESSES[idx];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const OnboardHeroArt: React.FC<{ variant?: 'people' | 'service' }> = ({ variant = 'people' }) => (
  <svg
    className="grab-onboard__art"
    viewBox="0 0 120 96"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <ellipse cx="60" cy="88" rx="42" ry="6" fill="#E8F8EE" />
    {variant === 'people' ? (
      <>
        <rect x="18" y="36" width="36" height="42" rx="10" fill="#25A55E" />
        <circle cx="36" cy="28" r="12" fill="#F5D0A9" />
        <rect x="66" y="40" width="36" height="38" rx="10" fill="#1A7A43" />
        <circle cx="84" cy="30" r="12" fill="#F5D0A9" />
        <rect x="28" y="48" width="16" height="10" rx="3" fill="#fff" opacity="0.9" />
        <rect x="76" y="50" width="16" height="10" rx="3" fill="#fff" opacity="0.9" />
      </>
    ) : (
      <>
        <rect x="14" y="52" width="52" height="28" rx="8" fill="#25A55E" />
        <circle cx="28" cy="82" r="8" fill="#091B37" />
        <circle cx="52" cy="82" r="8" fill="#091B37" />
        <path d="M66 58h28l10 16H66V58Z" fill="#1A7A43" />
        <circle cx="88" cy="82" r="8" fill="#091B37" />
        <circle cx="98" cy="36" r="16" fill="#E8F8EE" />
        <path d="M90 36h16M98 28v16" stroke="#25A55E" strokeWidth="3" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const RegisterQuickServicePage: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = React.useState<Phase>('phone');

  const [phone, setPhone] = React.useState('');
  const [otpDigits, setOtpDigits] = React.useState(['', '', '', '', '', '']);
  const [resendIn, setResendIn] = React.useState(0);
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const [ownerName, setOwnerName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [cccd, setCccd] = React.useState('');
  const [cccdFront, setCccdFront] = React.useState<string | null>(null);
  const [cccdBack, setCccdBack] = React.useState<string | null>(null);

  const [stationName, setStationName] = React.useState('');
  const [addressDetail, setAddressDetail] = React.useState('');
  const [coords, setCoords] = React.useState<GeoPoint | null>(null);
  const [services, setServices] = React.useState<string[]>([]);
  const [serviceDraft, setServiceDraft] = React.useState<string[]>([]);
  const [servicesOpen, setServicesOpen] = React.useState(false);
  const [contractOpen, setContractOpen] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);
  const [contractViewed, setContractViewed] = React.useState(false);

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const frontInputRef = React.useRef<HTMLInputElement>(null);
  const backInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = window.setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendIn]);

  const clearError = (key: string) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleClose = () => navigate('/login');

  const handleBack = () => {
    setErrors({});
    if (phase === 'phone') {
      navigate('/login');
      return;
    }
    if (phase === 'otp') {
      setPhase('phone');
      return;
    }
    if (phase === 'owner') {
      setPhase('otp');
      return;
    }
    if (phase === 'station') {
      setPhase('owner');
      return;
    }
    if (phase === 'summary') {
      setPhase('station');
      return;
    }
    navigate('/login');
  };

  const handleSendOtp = () => {
    setErrors({});
    if (!isValidRegisterPhone(phone)) {
      setErrors({
        phone: 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng 0xxxxxxxxx.',
      });
      return;
    }
    startRegisterOtp(phone);
    setOtpDigits(['', '', '', '', '', '']);
    setResendIn(REGISTER_OTP_RESEND_SEC);
    setPhase('otp');
    window.setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleVerifyOtp = () => {
    const code = otpDigits.join('');
    const result = verifyRegisterOtp(code);
    if (result.status === 'ok') {
      setErrors({});
      setPhase('owner');
      return;
    }
    if (result.status === 'locked') {
      setErrors({ otp: 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau.' });
      return;
    }
    if (result.status === 'expired') {
      setErrors({ otp: 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.' });
      setOtpDigits(['', '', '', '', '', '']);
      return;
    }
    setErrors({ otp: `Mã OTP không đúng. Còn ${result.remaining} lần thử.` });
    setOtpDigits(['', '', '', '', '', '']);
    otpRefs.current[0]?.focus();
  };

  const handleResendOtp = () => {
    if (resendIn > 0) return;
    const next = resendRegisterOtp();
    if (!next) {
      setPhase('phone');
      return;
    }
    setErrors({});
    setOtpDigits(['', '', '', '', '', '']);
    setResendIn(REGISTER_OTP_RESEND_SEC);
    otpRefs.current[0]?.focus();
  };

  const validateOwner = (): boolean => {
    const next: Record<string, string> = {};
    if (!ownerName.trim()) next.ownerName = 'Vui lòng nhập tên chủ trạm.';
    if (!isValidEmail(email)) next.email = 'Email không hợp lệ.';
    if (!isValidCccd(cccd)) next.cccd = 'CCCD phải gồm 9 hoặc 12 chữ số.';
    if (!cccdFront) next.cccdFront = 'Vui lòng chụp mặt trước CCCD.';
    if (!cccdBack) next.cccdBack = 'Vui lòng chụp mặt sau CCCD.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStation = (): boolean => {
    const next: Record<string, string> = {};
    if (!stationName.trim()) next.stationName = 'Vui lòng nhập tên trạm.';
    if (!coords) next.location = 'Vui lòng chọn vị trí trên bản đồ.';
    if (!addressDetail.trim()) next.addressDetail = 'Vui lòng nhập hoặc chọn địa chỉ chi tiết.';
    if (services.length === 0) next.services = 'Chọn ít nhất một dịch vụ cung cấp.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (phase === 'owner') {
      if (!validateOwner()) return;
      setPhase('station');
      return;
    }
    if (phase === 'station') {
      if (!validateStation()) return;
      setPhase('summary');
      return;
    }
    if (phase === 'summary') {
      if (!contractViewed) {
        setErrors({ agreed: 'Vui lòng xem điều khoản trước khi gửi đăng ký.' });
        return;
      }
      if (!agreed) {
        setErrors({ agreed: 'Vui lòng đồng ý với điều khoản để tiếp tục.' });
        return;
      }
      clearRegisterOtpSession();
      setPhase('done');
      return;
    }
    navigate('/login');
  };

  const onOtpChange = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...otpDigits];
    next[i] = v;
    setOtpDigits(next);
    clearError('otp');
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const onPickLocation = (point: GeoPoint) => {
    setCoords(point);
    if (!addressDetail.trim()) setAddressDetail(addressFromPoint(point));
    clearError('location');
    clearError('addressDetail');
  };

  const useCurrentDemoLocation = () => {
    const point = {
      lat: Number((EMPTY_MAP_CENTER.lat + (Math.random() - 0.5) * 0.02).toFixed(6)),
      lng: Number((EMPTY_MAP_CENTER.lng + (Math.random() - 0.5) * 0.02).toFixed(6)),
    };
    setCoords(point);
    setAddressDetail(addressFromPoint(point));
    clearError('location');
    clearError('addressDetail');
  };

  const onCaptureCccd = async (side: 'front' | 'back', file: File | null) => {
    if (!file) return;
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (side === 'front') {
        setCccdFront(dataUrl);
        clearError('cccdFront');
      } else {
        setCccdBack(dataUrl);
        clearError('cccdBack');
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        [side === 'front' ? 'cccdFront' : 'cccdBack']: 'Không đọc được ảnh. Thử lại.',
      }));
    }
  };

  const openServicesSheet = () => {
    setServiceDraft(services);
    setServicesOpen(true);
  };

  const applyServices = () => {
    setServices(serviceDraft);
    clearError('services');
    setServicesOpen(false);
  };

  const toggleDraftService = (label: string) => {
    setServiceDraft((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );
  };

  const openContract = () => {
    setContractOpen(true);
    setContractViewed(true);
    clearError('agreed');
  };

  const otpComplete = otpDigits.every((d) => d.length === 1);
  const session = readRegisterOtpSession();
  const verifiedPhone = session?.phone ?? phone.replace(/\D/g, '');
  const expiredOnLoad = session ? isRegisterOtpExpired(session) : false;

  const agreeLabel = (
    <>
      Tôi đã đọc, tự nguyện tham gia, đồng ý với{' '}
      <a
        className="grab-onboard__legal-link"
        href="#dieu-khoan-san-pham"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openContract();
        }}
      >
        Điều khoản Sản phẩm VETC RSA
      </a>
      ,{' '}
      <a
        className="grab-onboard__legal-link"
        href="#chinh-sach-bao-ve-du-lieu"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openContract();
        }}
      >
        Chính sách bảo vệ dữ liệu cá nhân
      </a>{' '}
      của VETC RSA và cho phép đối tác sử dụng các thông tin trên để cung cấp dịch vụ.
    </>
  );

  const servicesSheet = servicesOpen ? (
    <div
      className="dls-sheet-overlay"
      role="dialog"
      aria-modal
      aria-label="Dịch vụ cung cấp"
      onClick={() => setServicesOpen(false)}
    >
      <div className="dls-sheet grab-onboard-sheet" onClick={(e) => e.stopPropagation()}>
        <DlsSheetHandle />
        <div className="grab-onboard-sheet__head">
          <h3>Dịch vụ cung cấp</h3>
          <button type="button" className="grab-onboard-sheet__close" onClick={() => setServicesOpen(false)} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        <div className="grab-onboard-sheet__list">
          {STATION_SERVICES.map((label) => {
            const on = serviceDraft.includes(label);
            return (
              <button
                key={label}
                type="button"
                className={`grab-onboard-sheet__item${on ? ' grab-onboard-sheet__item--on' : ''}`}
                onClick={() => toggleDraftService(label)}
              >
                <span>{label}</span>
                {on && <Check size={18} strokeWidth={2.5} className="grab-onboard-sheet__check" />}
              </button>
            );
          })}
        </div>
        <div className="grab-onboard-sheet__footer">
          <DlsBrandButton onClick={applyServices} disabled={serviceDraft.length === 0}>
            Xác nhận{serviceDraft.length > 0 ? ` (${serviceDraft.length})` : ''}
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  ) : null;

  const contractSheet = contractOpen ? (
    <div
      className="dls-sheet-overlay"
      role="dialog"
      aria-modal
      aria-label="Hợp đồng PDF"
      onClick={() => setContractOpen(false)}
    >
      <div
        className="dls-sheet grab-onboard-sheet grab-onboard-sheet--pdf"
        onClick={(e) => e.stopPropagation()}
      >
        <DlsSheetHandle />
        <div className="grab-onboard-sheet__head">
          <h3>Hợp đồng hợp tác</h3>
          <button
            type="button"
            className="grab-onboard-sheet__close"
            onClick={() => setContractOpen(false)}
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grab-onboard-pdf">
          <div className="grab-onboard-pdf__toolbar">
            <FileText size={16} strokeWidth={2} />
            <div className="grab-onboard-pdf__toolbar-text">
              <strong>hop-dong-tram-quick-service.pdf</strong>
              <span>PDF · 1 trang · {new Date().toLocaleDateString('vi-VN')}</span>
            </div>
          </div>

          <div className="grab-onboard-pdf__viewport">
            <article className="grab-onboard-pdf__page" aria-label="Xem trước hợp đồng PDF">
              <header className="grab-onboard-pdf__page-head">
                <p className="grab-onboard-pdf__brand">VETC · Workfield</p>
                <h4>HỢP ĐỒNG HỢP TÁC VẬN HÀNH TRẠM QUICK SERVICE</h4>
                <p className="grab-onboard-pdf__doc-no">
                  Số: QS-{verifiedPhone.slice(-4) || '0000'}/
                  {new Date().getFullYear()} · Ngày {new Date().toLocaleDateString('vi-VN')}
                </p>
              </header>

              <p className="grab-onboard-pdf__intro">
                Bên A (VETC Workfield) và Bên B (Chủ trạm) thỏa thuận hợp tác vận hành Trạm Quick
                Service theo các thông tin đăng ký sau đây.
              </p>

              <section className="grab-onboard-pdf__block">
                <h5>Điều 1. Thông tin Bên B — Chủ trạm</h5>
                <ul>
                  <li>
                    <em>Họ và tên:</em> {ownerName.trim() || '—'}
                  </li>
                  <li>
                    <em>Số điện thoại:</em> {maskRegisterPhone(verifiedPhone)}
                  </li>
                  <li>
                    <em>Email:</em> {email.trim() || '—'}
                  </li>
                  <li>
                    <em>CCCD:</em> {cccd.trim() || '—'}
                  </li>
                </ul>
              </section>

              <section className="grab-onboard-pdf__block">
                <h5>Điều 2. Thông tin Trạm Quick Service</h5>
                <ul>
                  <li>
                    <em>Tên trạm:</em> {stationName.trim() || '—'}
                  </li>
                  <li>
                    <em>Địa chỉ:</em> {addressDetail.trim() || '—'}
                  </li>
                  <li>
                    <em>Dịch vụ cung cấp:</em>{' '}
                    {services.length > 0 ? services.join('; ') : '—'}
                  </li>
                </ul>
              </section>

              <section className="grab-onboard-pdf__block">
                <h5>Điều 3. Cam kết</h5>
                <ol>
                  <li>Bên B cam kết cung cấp dịch vụ đúng năng lực đã đăng ký.</li>
                  <li>Hồ sơ được duyệt trước khi kích hoạt tài khoản vận hành.</li>
                  <li>
                    Bên B chịu trách nhiệm về tính chính xác của CCCD và thông tin liên hệ.
                  </li>
                </ol>
              </section>

              <footer className="grab-onboard-pdf__sign">
                <div>
                  <p>ĐẠI DIỆN BÊN A</p>
                  <span>VETC Workfield</span>
                </div>
                <div>
                  <p>ĐẠI DIỆN BÊN B</p>
                  <span>{ownerName.trim() || 'Chủ trạm'}</span>
                </div>
              </footer>
            </article>
          </div>
        </div>

        <div className="grab-onboard-sheet__footer">
          <DlsBrandButton
            onClick={() => {
              setContractViewed(true);
              clearError('agreed');
              setContractOpen(false);
            }}
          >
            Xác nhận
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    </div>
  ) : null;

  /* ——— Phone (Grab: New registration) ——— */
  if (phase === 'phone') {
    return (
      <div className="dm-screen grab-onboard">
        <DlsTopNav onBack={handleClose} backIcon="close" />
        <div className="dm-scroll-area">
          <div className="grab-onboard__content">
            <div className="grab-onboard__hero">
              <div className="grab-onboard__hero-copy">
                <h1>Đăng ký Trạm Quick Service</h1>
                <p>Xác minh số điện thoại để bắt đầu.</p>
              </div>
              <OnboardHeroArt />
            </div>
            <DlsTextField
              label="Số điện thoại"
              value={phone}
              onChange={(v) => {
                setPhone(v);
                clearError('phone');
              }}
              placeholder="Nhập SĐT"
              required
              error={errors.phone}
            />
          </div>
        </div>
        <div className="grab-onboard__footer">
          <DlsBrandButton onClick={handleSendOtp} disabled={phone.trim().length < 9}>
            Tiếp tục
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    );
  }

  /* ——— OTP (Grab: Verify account with OTP) ——— */
  if (phase === 'otp') {
    return (
      <div className="dm-screen grab-onboard">
        <DlsTopNav onBack={handleBack} />
        <div className="dm-scroll-area">
          <div className="grab-onboard__content">
            <div className="grab-onboard__hero grab-onboard__hero--stack">
              <h1>Xác minh tài khoản bằng OTP</h1>
              <p>Chúng tôi đã gửi mã 6 số tới {maskRegisterPhone(verifiedPhone)}.</p>
            </div>

            <div className="dls-otp-block">
              <div className="dls-otp-row">
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    className={`dls-otp-input${errors.otp ? ' dls-otp-input--error' : ''}`}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    aria-invalid={errors.otp ? true : undefined}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="dls-otp-error" role="alert">
                  {errors.otp}
                </p>
              )}
              {!errors.otp && expiredOnLoad && (
                <p className="dls-otp-error" role="alert">
                  Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.
                </p>
              )}
              <p className="grab-onboard-otp__help">
                Không nhận được mã?{' '}
                {resendIn > 0 ? (
                  <span>Yêu cầu mã mới sau {resendIn}s</span>
                ) : (
                  <button type="button" className="dls-link-btn" onClick={handleResendOtp}>
                    Gửi lại mã
                  </button>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="grab-onboard__footer">
          <DlsBrandButton onClick={handleVerifyOtp} disabled={!otpComplete}>
            Tiếp tục
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    );
  }

  /* ——— Owner (Grab: Tell us about yourself) ——— */
  if (phase === 'owner') {
    const ready =
      ownerName.trim() && email.trim() && cccd.trim() && cccdFront && cccdBack;
    return (
      <div className="dm-screen grab-onboard">
        <DlsTopNav onBack={handleBack} />
        <div className="dm-scroll-area">
          <div className="grab-onboard__content">
            <div className="grab-onboard__hero">
              <div className="grab-onboard__hero-copy">
                <h1>Thông tin chủ trạm</h1>
                <p>Cho chúng tôi biết về bạn.</p>
              </div>
              <OnboardHeroArt />
            </div>

            <div className="grab-onboard__fields">
              <DlsTextField
                label="Tên chủ trạm"
                value={ownerName}
                onChange={(v) => {
                  setOwnerName(v);
                  clearError('ownerName');
                }}
                placeholder="Họ và tên"
                required
                error={errors.ownerName}
              />
              <DlsTextField
                label="Email"
                value={email}
                onChange={(v) => {
                  setEmail(v);
                  clearError('email');
                }}
                placeholder="email@example.com"
                required
                error={errors.email}
              />
              <DlsTextField
                label="Số CCCD"
                value={cccd}
                onChange={(v) => {
                  setCccd(v);
                  clearError('cccd');
                }}
                placeholder="9 hoặc 12 chữ số"
                required
                error={errors.cccd}
              />

              <div className="grab-onboard__cccd">
                <DlsLabel required>Ảnh CCCD</DlsLabel>
                <div className="grab-onboard__cccd-grid">
                  <div
                    className={`grab-onboard__cccd-slot${cccdFront ? ' grab-onboard__cccd-slot--filled' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => frontInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') frontInputRef.current?.click();
                    }}
                  >
                    {cccdFront ? (
                      <>
                        <img src={cccdFront} alt="CCCD mặt trước" />
                        <span className="grab-onboard__cccd-badge">Mặt trước</span>
                        <button
                          type="button"
                          className="grab-onboard__cccd-remove"
                          aria-label="Xoá ảnh mặt trước"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCccdFront(null);
                          }}
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera size={22} strokeWidth={1.75} />
                        <span>Chụp mặt trước</span>
                      </>
                    )}
                  </div>
                  <div
                    className={`grab-onboard__cccd-slot${cccdBack ? ' grab-onboard__cccd-slot--filled' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => backInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') backInputRef.current?.click();
                    }}
                  >
                    {cccdBack ? (
                      <>
                        <img src={cccdBack} alt="CCCD mặt sau" />
                        <span className="grab-onboard__cccd-badge">Mặt sau</span>
                        <button
                          type="button"
                          className="grab-onboard__cccd-remove"
                          aria-label="Xoá ảnh mặt sau"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCccdBack(null);
                          }}
                        >
                          <X size={14} strokeWidth={2.5} />
                        </button>
                      </>
                    ) : (
                      <>
                        <IdCard size={22} strokeWidth={1.75} />
                        <span>Chụp mặt sau</span>
                      </>
                    )}
                  </div>
                </div>
                {(errors.cccdFront || errors.cccdBack) && (
                  <p className="dls-field-error" role="alert">
                    {errors.cccdFront || errors.cccdBack}
                  </p>
                )}
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(e) => {
                    void onCaptureCccd('front', e.target.files?.[0] ?? null);
                    e.target.value = '';
                  }}
                />
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={(e) => {
                    void onCaptureCccd('back', e.target.files?.[0] ?? null);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grab-onboard__footer">
          <DlsBrandButton
            onClick={handleNext}
            disabled={!ready}
          >
            Tiếp tục
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
      </div>
    );
  }

  /* ——— Station + services (Grab: Choose service preference) ——— */
  if (phase === 'station') {
    const ready =
      stationName.trim() && coords && addressDetail.trim() && services.length > 0;
    return (
      <div className="dm-screen grab-onboard">
        <DlsTopNav onBack={handleBack} />
        <div className="dm-scroll-area">
          <div className="grab-onboard__content">
            <div className="grab-onboard__hero">
              <div className="grab-onboard__hero-copy">
                <h1>Thông tin trạm & dịch vụ</h1>
                <p>Chọn vị trí và dịch vụ bạn cung cấp.</p>
              </div>
              <OnboardHeroArt variant="service" />
            </div>

            <div className="grab-onboard__fields">
              <DlsTextField
                label="Tên trạm"
                value={stationName}
                onChange={(v) => {
                  setStationName(v);
                  clearError('stationName');
                }}
                placeholder="Tên Trạm Quick Service"
                required
                error={errors.stationName}
              />

              <div className="grab-onboard__location">
                <div className="grab-onboard__location-head">
                  <DlsLabel required>Vị trí trạm</DlsLabel>
                  <button type="button" className="grab-onboard__text-btn" onClick={useCurrentDemoLocation}>
                    <MapPin size={14} strokeWidth={2} />
                    Vị trí hiện tại
                  </button>
                </div>
                <StationMapPicker value={coords} onChange={onPickLocation} />
                {errors.location && (
                  <p className="dls-field-error" role="alert">
                    {errors.location}
                  </p>
                )}
                <DlsTextField
                  label="Địa chỉ chi tiết"
                  value={addressDetail}
                  onChange={(v) => {
                    setAddressDetail(v);
                    clearError('addressDetail');
                  }}
                  placeholder="Số nhà, đường, phường/xã…"
                  required
                  error={errors.addressDetail}
                />
              </div>

              <div className="dls-field">
                <DlsLabel required>Dịch vụ cung cấp</DlsLabel>
                <button
                  type="button"
                  className={`dls-input-wrap grab-onboard__select-trigger${
                    errors.services ? ' dls-input-wrap--error' : ''
                  }${servicesOpen ? ' grab-onboard__select-trigger--open' : ''}`}
                  onClick={openServicesSheet}
                >
                  <span
                    className={`grab-onboard__select-value${
                      services.length === 0 ? ' grab-onboard__select-placeholder' : ''
                    }`}
                  >
                    {services.length === 0
                      ? 'Chọn dịch vụ'
                      : `Đã chọn ${services.length} dịch vụ`}
                  </span>
                  <ChevronRight size={18} strokeWidth={2} className="grab-onboard__select-chevron" />
                </button>
                {services.length > 0 && (
                  <div className="grab-onboard__service-tags" aria-label="Dịch vụ đã chọn">
                    {services.slice(0, 3).map((s) => (
                      <span key={s} className="grab-onboard__service-tag">
                        {s}
                      </span>
                    ))}
                    {services.length > 3 && (
                      <span className="grab-onboard__service-tag grab-onboard__service-tag--more">
                        +{services.length - 3}
                      </span>
                    )}
                  </div>
                )}
                {errors.services && (
                  <p className="dls-field-error" role="alert">
                    {errors.services}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grab-onboard__footer">
          <DlsBrandButton onClick={handleNext} disabled={!ready}>
            Tiếp tục
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
        {servicesSheet}
      </div>
    );
  }

  /* ——— Summary ——— */
  if (phase === 'summary') {
    return (
      <div className="dm-screen grab-onboard">
        <DlsTopNav onBack={handleBack} />
        <div className="dm-scroll-area">
          <div className="grab-onboard__content">
            <div className="grab-onboard__hero grab-onboard__hero--stack">
              <h1>Xác nhận đăng ký</h1>
              <p>Kiểm tra lại thông tin trước khi gửi hồ sơ.</p>
            </div>

            <section className="grab-onboard__summary-card">
              <div className="grab-onboard__summary-head">
                <h3>Chủ trạm</h3>
                <button type="button" className="grab-onboard__text-btn" onClick={() => setPhase('owner')}>
                  Sửa
                </button>
              </div>
              <DlsDetailRow label="Họ và tên" value={ownerName.trim()} />
              <DlsDetailRow label="Số điện thoại" value={maskRegisterPhone(verifiedPhone)} />
              <DlsDetailRow label="Email" value={email.trim()} />
              <DlsDetailRow label="CCCD" value={cccd.trim()} last />
              <div className="grab-onboard__summary-photos">
                {cccdFront && <img src={cccdFront} alt="CCCD mặt trước" />}
                {cccdBack && <img src={cccdBack} alt="CCCD mặt sau" />}
              </div>
            </section>

            <section className="grab-onboard__summary-card">
              <div className="grab-onboard__summary-head">
                <h3>Trạm Quick Service</h3>
                <button type="button" className="grab-onboard__text-btn" onClick={() => setPhase('station')}>
                  Sửa
                </button>
              </div>
              <DlsDetailRow label="Tên trạm" value={stationName.trim()} />
              <DlsDetailRow label="Địa chỉ" value={addressDetail.trim()} multiline />
              <DlsDetailRow label="Dịch vụ" value={services.join(', ')} multiline last />
            </section>

            <button type="button" className="grab-onboard__contract-btn" onClick={openContract}>
              <FileText size={18} strokeWidth={2} />
              <span>Xem hợp đồng</span>
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>
        </div>
        <div className="grab-onboard__footer grab-onboard__footer--legal">
          <div className="grab-onboard__agree">
            <DlsCheckbox
              checked={agreed}
              onChange={(v) => {
                setAgreed(v);
                clearError('agreed');
              }}
              label={agreeLabel}
            />
            {errors.agreed && (
              <p className="dls-field-error" role="alert">
                {errors.agreed}
              </p>
            )}
          </div>
          <DlsBrandButton onClick={handleNext} disabled={!agreed || !contractViewed}>
            Đăng ký
          </DlsBrandButton>
        </div>
        <DlsHomeIndicator />
        {contractSheet}
      </div>
    );
  }

  /* ——— Done ——— */
  return (
    <div className="dm-screen grab-onboard">
      <div className="grab-onboard__success">
        <div className="grab-onboard__success-icon" aria-hidden>
          <Check size={36} strokeWidth={2.5} />
        </div>
        <h1>Đăng ký thành công</h1>
        <p>
          Hồ sơ <strong>{stationName.trim()}</strong> đã được gửi. VETC sẽ liên hệ qua SĐT{' '}
          {maskRegisterPhone(verifiedPhone)} sau khi duyệt.
        </p>
      </div>
      <div className="grab-onboard__footer">
        <DlsBrandButton onClick={() => navigate('/sign-in')}>OK</DlsBrandButton>
      </div>
      <DlsHomeIndicator />
    </div>
  );
};

export default RegisterQuickServicePage;
