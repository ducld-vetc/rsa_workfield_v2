import React from 'react';
import { ChevronLeft, Eye, EyeOff, X, Check, Filter, Bell, Settings, Lock, LogOut, ChevronRight, ChevronDown, Navigation, Clock, Search } from 'lucide-react';

/* ——— Typography helpers ——— */
export const DlsLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
  children,
  required,
}) => (
  <label className="dls-label">
    {children}
    {required && <span className="dls-required">*</span>}
  </label>
);

/* ——— Text field (DLS Text field) ——— */
export const DlsTextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: 'text' | 'password';
  required?: boolean;
  error?: string;
}> = ({ label, value, onChange, placeholder, type = 'text', required, error }) => {
  const [show, setShow] = React.useState(false);
  const isPassword = type === 'password';

  return (
    <div className="dls-field">
      <DlsLabel required={required}>{label}</DlsLabel>
      <div className={`dls-input-wrap${error ? ' dls-input-wrap--error' : ''}`}>
        <input
          className="dls-input"
          type={isPassword && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
        />
        {isPassword && (
          <button type="button" className="dls-input-icon" onClick={() => setShow(!show)} aria-label="Hiện mật khẩu">
            {show ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
          </button>
        )}
      </div>
      {error && <p className="dls-field-error" role="alert">{error}</p>}
    </div>
  );
};

/* ——— Search field (DLS Search field) ——— */
export const DlsSearchField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  ariaLabel?: string;
}> = ({ value, onChange, placeholder = 'Tìm kiếm...', onSubmit, ariaLabel = 'Tìm kiếm' }) => (
  <div className="dls-search-field">
    <input
      className="dls-search-field__input"
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSubmit?.();
      }}
    />
    <button
      type="button"
      className="dls-search-field__btn"
      onClick={() => onSubmit?.()}
      aria-label="Tìm kiếm"
    >
      <Search size={18} strokeWidth={2.25} />
    </button>
  </div>
);

/* ——— Select field (DLS picker sheet — không dùng native <select>) ——— */
export const DlsSelectField: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  sheetTitle?: string;
}> = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Chọn',
  required,
  sheetTitle,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <div className="dls-field">
        <DlsLabel required={required}>{label}</DlsLabel>
        <button
          type="button"
          className={`dls-select-trigger${value ? '' : ' dls-select-trigger--placeholder'}`}
          onClick={() => setOpen(true)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span>{value || placeholder}</span>
          <ChevronDown size={18} strokeWidth={2} aria-hidden />
        </button>
      </div>

      {open && (
        <div
          className="dls-sheet-overlay"
          role="dialog"
          aria-modal
          aria-label={sheetTitle || label}
          onClick={() => setOpen(false)}
        >
          <div className="dls-sheet" onClick={(event) => event.stopPropagation()}>
            <DlsSheetHeader title={sheetTitle || label} onClose={() => setOpen(false)} />
            <div className="dls-sheet-body dls-sheet-body--form">
              <div className="dls-reason-list" role="listbox" aria-label={label}>
                {options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={value === option}
                    className={`dls-reason-item${value === option ? ' dls-reason-item--on' : ''}`}
                    onClick={() => {
                      onChange(option);
                      setOpen(false);
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <DlsHomeIndicator />
          </div>
        </div>
      )}
    </>
  );
};

/* ——— Brand button (DLS Brand button Large/Filled) ——— */
export const DlsBrandButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'lg' | 'sm';
}> = ({ children, onClick, disabled, fullWidth = true, size = 'lg' }) => (
  <button
    type="button"
    className={`dls-btn-brand ${size === 'sm' ? 'dls-btn-sm' : ''} ${fullWidth ? 'dls-btn-full' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

/* ——— Neutral button ——— */
export const DlsNeutralButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  size?: 'lg' | 'sm';
  fullWidth?: boolean;
}> = ({ children, onClick, disabled, icon, size = 'lg', fullWidth = true }) => (
  <button
    type="button"
    className={`dls-btn-neutral ${size === 'sm' ? 'dls-btn-sm' : ''} ${fullWidth ? 'dls-btn-full' : ''}`}
    onClick={onClick}
    disabled={disabled}
  >
    {icon && <span className="dls-btn-icon">{icon}</span>}
    {children}
  </button>
);

/* ——— Brand checkbox ——— */
export const DlsCheckbox: React.FC<{
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}> = ({ checked, onChange, label }) => (
  <label className="dls-checkbox-row">
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={`dls-checkbox ${checked ? 'dls-checkbox--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
    <span className="dls-checkbox-label">{label}</span>
  </label>
);

/* ——— Status badge (DLS Status badge) ——— */
export type DlsStatusVariant = 'warning' | 'success' | 'info' | 'neutral' | 'danger';

export const DlsStatusBadge: React.FC<{
  label: string;
  variant?: DlsStatusVariant;
  dotColor?: string;
  showDot?: boolean;
}> = ({ label, variant = 'warning', dotColor, showDot = true }) => (
  <span
    className={`dls-status-badge dls-status-badge--${variant}${showDot ? '' : ' dls-status-badge--no-dot'}`}
  >
    {showDot && (
      <span
        className="dls-status-dot"
        style={dotColor ? { background: dotColor } : undefined}
      />
    )}
    {label}
  </span>
);

/* ——— Selection chip ——— */
export const DlsChip: React.FC<{
  label: string;
  selected?: boolean;
  brand?: boolean;
  badge?: number;
  onClick?: () => void;
  icon?: React.ReactNode;
}> = ({ label, selected, brand, badge, onClick, icon }) => (
  <button
    type="button"
    className={`dls-chip ${selected ? (brand ? 'dls-chip--brand' : 'dls-chip--selected') : ''}`}
    onClick={onClick}
  >
    {icon}
    <span className="dls-chip__label">{label}</span>
    {badge != null && badge > 0 && <span className="dls-chip-badge">{badge}</span>}
  </button>
);

/* ——— Top nav — Native app (Grab-style flat) ——— */
export const DlsTopNav: React.FC<{
  title?: string;
  variant?: 'brand' | 'default';
  titleAlign?: 'center' | 'start';
  onBack?: () => void;
  backIcon?: 'back' | 'close';
  actions?: React.ReactNode;
}> = ({ title = '', variant = 'brand', titleAlign = 'center', onBack, backIcon = 'back', actions }) => (
  <header className={`dls-topnav ${variant === 'brand' ? 'dls-topnav--brand' : ''}`}>
    {onBack ? (
      <button
        type="button"
        className="dls-topnav-back"
        onClick={onBack}
        aria-label={backIcon === 'close' ? 'Đóng' : 'Quay lại'}
      >
        {backIcon === 'close' ? <X size={22} strokeWidth={2} /> : <ChevronLeft size={24} strokeWidth={2} />}
      </button>
    ) : (
      <div className="dls-topnav-spacer" />
    )}
    <h1
      className={[
        'dls-topnav-title',
        titleAlign === 'start' ? 'dls-topnav-title--start' : '',
        !title ? 'dls-topnav-title--empty' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {title || '\u00a0'}
    </h1>
    <div className="dls-topnav-actions">{actions ?? <div className="dls-topnav-spacer" />}</div>
  </header>
);

export const DlsNavIconButton: React.FC<{
  icon: 'bell' | 'settings';
  badge?: number;
  onClick?: () => void;
  overlay?: boolean;
}> = ({ icon, badge, onClick, overlay }) => (
  <button
    type="button"
    className={`dls-nav-icon-btn ${overlay ? 'dls-nav-icon-btn--overlay' : ''}`}
    onClick={onClick}
    aria-label={icon === 'bell' ? 'Thông báo' : 'Cài đặt'}
  >
    {icon === 'bell' ? <Bell size={20} /> : <Settings size={20} />}
    {badge != null && badge > 0 && <span className="dls-nav-badge">{badge}</span>}
  </button>
);

/* ——— Toggle (Settings — Sẵn sàng cứu hộ) ——— */
export const DlsToggle: React.FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    className={`dls-toggle ${on ? 'dls-toggle--on' : ''}`}
    onClick={() => onChange(!on)}
  >
    <span className="dls-toggle-handle" />
  </button>
);

/* ——— Sheet header ——— */
export const DlsSheetHandle: React.FC = () => (
  <div className="dls-sheet-handle-wrap">
    <div className="dls-sheet-handle" />
  </div>
);

export const DlsSheetHeader: React.FC<{ title: string; onClose: () => void }> = ({ title, onClose }) => (
  <div className="dls-sheet-header">
    <DlsSheetHandle />
    <div className="dls-sheet-header-row">
      <h2 className="dls-sheet-title">{title}</h2>
      <button type="button" className="dls-sheet-close" onClick={onClose} aria-label="Đóng">
        <X size={20} />
      </button>
    </div>
  </div>
);

/* ——— Detail / order ——— */
export const DlsDetailSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <section className="dls-detail-section">
    <h3 className="dls-section-title">{title}</h3>
    {children}
  </section>
);

export const DlsDetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
  last?: boolean;
  multiline?: boolean;
}> = ({ label, value, last, multiline }) => (
  <div
    className={`dls-detail-row ${last ? 'dls-detail-row--last' : ''} ${multiline ? 'dls-detail-row--multi' : ''}`}
  >
    <span className="dls-detail-row__label">{label}</span>
    <span className="dls-detail-row__value">{value}</span>
  </div>
);

export const DlsTextLink: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
}> = ({ children, onClick, href, className = '' }) => {
  if (href) {
    return (
      <a className={`dls-text-link ${className}`} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={`dls-text-link ${className}`} onClick={onClick}>
      {children}
    </button>
  );
};

export const DlsLocationRow: React.FC<{
  label: string;
  address: string;
  variant?: 'pickup' | 'tow';
  onNavigate?: () => void;
  trailing?: React.ReactNode;
}> = ({ label, address, variant = 'pickup', onNavigate, trailing }) => (
  <div className="dls-location-row">
    <div className="dls-location-row__head">
      <div className="dls-location-row__label-wrap">
        <span className={`dls-location-row__dot dls-location-row__dot--${variant}`} aria-hidden />
        <span className="dls-location-row__label">{label}</span>
      </div>
      <div className="dls-location-row__actions">
        {trailing}
        {onNavigate && address.trim() && (
          <button
            type="button"
            className="dls-location-nav-btn"
            onClick={onNavigate}
            aria-label={`Chỉ đường — ${label}`}
          >
            <Navigation size={14} strokeWidth={2.25} aria-hidden />
            Chỉ đường
          </button>
        )}
      </div>
    </div>
    <p className="dls-location-row__addr">{address}</p>
  </div>
);

export const DlsEtaCard: React.FC<{
  minutes?: number;
  distanceKm?: number;
  etaTime?: string;
}> = ({ minutes, distanceKm, etaTime }) => {
  const primary =
    minutes != null ? `${minutes} phút` : etaTime ? `ETA ${etaTime}` : null;
  if (!primary) return null;

  return (
    <div className="dls-eta-card" role="status">
      <div className="dls-eta-card__icon" aria-hidden>
        <Clock size={22} strokeWidth={2} />
      </div>
      <div>
        <p className="dls-eta-card__label">Thời gian dự kiến</p>
        <p className="dls-eta-card__value">{primary}</p>
        {distanceKm != null && <p className="dls-eta-card__meta">Khoảng {distanceKm} km</p>}
      </div>
    </div>
  );
};

/* ——— Settings list row ——— */
export const DlsListRow: React.FC<{
  icon?: React.ReactNode;
  label: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}> = ({ icon, label, trailing, onClick, danger }) => {
  const className = `dls-list-row ${danger ? 'dls-list-row--danger' : ''}`;
  const inner = (
    <>
      {icon && <span className="dls-list-row__icon">{icon}</span>}
      <span className="dls-list-row__label">{label}</span>
      {trailing ?? (onClick ? <ChevronRight size={18} className="dls-list-row__chevron" /> : null)}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
};

/* ——— Home indicator ——— */
export const DlsHomeIndicator: React.FC = () => (
  <div className="dls-home-indicator">
    <div className="dls-home-bar" />
  </div>
);

/* ——— Icons for settings ——— */
export const LockIcon = () => <Lock size={20} strokeWidth={1.75} />;
export const LogOutIcon = () => <LogOut size={20} strokeWidth={1.75} />;
export const FilterIcon = () => <Filter size={18} strokeWidth={2} />;
