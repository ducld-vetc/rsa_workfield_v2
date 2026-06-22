import { MOCK_QUOTE_DRIVERS } from '../data/mockQuoteResources';

const SESSION_KEY = 'rsa-forgot-password';

export const DEMO_OTP_CODE = '123456';
export const OTP_TTL_MS = 2 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_SEC = 60;

const REGISTERED_PHONES = new Set(
  MOCK_QUOTE_DRIVERS.map((driver) => normalizePhone(driver.phone)),
);

export interface ForgotPasswordSession {
  phone: string;
  otpCode: string;
  issuedAt: number;
  attempts: number;
}

export type OtpVerifyResult =
  | { status: 'ok' }
  | { status: 'wrong'; remaining: number }
  | { status: 'expired' }
  | { status: 'locked' };

export interface PasswordPolicyResult {
  valid: boolean;
  message: string | null;
  hints: string[];
}

export function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function isValidPhoneFormat(phone: string): boolean {
  const digits = normalizePhone(phone);
  return /^0\d{8,10}$/.test(digits);
}

export function isRegisteredPhone(phone: string): boolean {
  return REGISTERED_PHONES.has(normalizePhone(phone));
}

export function readForgotPasswordSession(): ForgotPasswordSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ForgotPasswordSession;
  } catch {
    return null;
  }
}

export function writeForgotPasswordSession(session: ForgotPasswordSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearForgotPasswordSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function startOtpSession(phone: string): ForgotPasswordSession {
  const session: ForgotPasswordSession = {
    phone: normalizePhone(phone),
    otpCode: DEMO_OTP_CODE,
    issuedAt: Date.now(),
    attempts: 0,
  };
  writeForgotPasswordSession(session);
  return session;
}

export function resendOtpSession(): ForgotPasswordSession | null {
  const current = readForgotPasswordSession();
  if (!current) return null;
  const next: ForgotPasswordSession = {
    ...current,
    otpCode: DEMO_OTP_CODE,
    issuedAt: Date.now(),
    attempts: 0,
  };
  writeForgotPasswordSession(next);
  return next;
}

export function isOtpExpired(session: ForgotPasswordSession, now = Date.now()): boolean {
  return now - session.issuedAt > OTP_TTL_MS;
}

export function verifyOtp(input: string, now = Date.now()): OtpVerifyResult {
  const session = readForgotPasswordSession();
  if (!session) {
    return { status: 'expired' };
  }

  if (session.attempts >= OTP_MAX_ATTEMPTS) {
    return { status: 'locked' };
  }

  if (isOtpExpired(session, now)) {
    return { status: 'expired' };
  }

  const code = input.replace(/\D/g, '');
  if (code === session.otpCode) {
    return { status: 'ok' };
  }

  const attempts = session.attempts + 1;
  writeForgotPasswordSession({ ...session, attempts });

  if (attempts >= OTP_MAX_ATTEMPTS) {
    return { status: 'locked' };
  }

  return { status: 'wrong', remaining: OTP_MAX_ATTEMPTS - attempts };
}

export interface PasswordPolicyCheck {
  id: string;
  label: string;
  message: string;
  met: boolean;
}

const PASSWORD_POLICY_RULES = [
  {
    id: 'length',
    label: 'Ít nhất 8 ký tự',
    message: 'Mật khẩu phải có ít nhất 8 ký tự.',
    test: (password: string) => password.length >= 8,
  },
  {
    id: 'case',
    label: 'Có chữ hoa và chữ thường',
    message: 'Mật khẩu phải có cả chữ hoa và chữ thường.',
    test: (password: string) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    id: 'digit',
    label: 'Có ít nhất 1 chữ số',
    message: 'Mật khẩu phải có ít nhất 1 chữ số.',
    test: (password: string) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'Có ít nhất 1 ký tự đặc biệt (!@#$%^&*)',
    message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*).',
    test: (password: string) => /[!@#$%^&*]/.test(password),
  },
] as const;

export function getPasswordPolicyChecks(password: string): PasswordPolicyCheck[] {
  return PASSWORD_POLICY_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    message: rule.message,
    met: rule.test(password),
  }));
}

export function validatePasswordPolicy(password: string): PasswordPolicyResult {
  const checks = getPasswordPolicyChecks(password);
  const hints = checks.map((check) => check.label);
  const failed = checks.find((check) => !check.met);

  if (failed) {
    return {
      valid: false,
      message: failed.message,
      hints,
    };
  }

  return { valid: true, message: null, hints };
}

export function maskPhone(phone: string): string {
  const digits = normalizePhone(phone);
  if (digits.length < 4) return digits;
  return `${digits.slice(0, 3)}***${digits.slice(-3)}`;
}
