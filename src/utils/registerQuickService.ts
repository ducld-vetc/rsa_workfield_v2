const SESSION_KEY = 'rsa-register-qs-otp';

export const REGISTER_DEMO_OTP = '123456';
export const REGISTER_OTP_TTL_MS = 2 * 60 * 1000;
export const REGISTER_OTP_MAX_ATTEMPTS = 5;
export const REGISTER_OTP_RESEND_SEC = 60;

export interface RegisterOtpSession {
  phone: string;
  otpCode: string;
  issuedAt: number;
  attempts: number;
  verified: boolean;
}

export type RegisterOtpVerifyResult =
  | { status: 'ok' }
  | { status: 'wrong'; remaining: number }
  | { status: 'expired' }
  | { status: 'locked' };

export function isValidRegisterPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return /^0\d{8,10}$/.test(digits);
}

export function maskRegisterPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return digits;
  return `${digits.slice(0, 3)}***${digits.slice(-3)}`;
}

export function readRegisterOtpSession(): RegisterOtpSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegisterOtpSession;
  } catch {
    return null;
  }
}

function writeSession(session: RegisterOtpSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearRegisterOtpSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export function startRegisterOtp(phone: string): RegisterOtpSession {
  const session: RegisterOtpSession = {
    phone: phone.replace(/\D/g, ''),
    otpCode: REGISTER_DEMO_OTP,
    issuedAt: Date.now(),
    attempts: 0,
    verified: false,
  };
  writeSession(session);
  return session;
}

export function resendRegisterOtp(): RegisterOtpSession | null {
  const current = readRegisterOtpSession();
  if (!current) return null;
  const next: RegisterOtpSession = {
    ...current,
    otpCode: REGISTER_DEMO_OTP,
    issuedAt: Date.now(),
    attempts: 0,
    verified: false,
  };
  writeSession(next);
  return next;
}

export function isRegisterOtpExpired(session: RegisterOtpSession, now = Date.now()): boolean {
  return now - session.issuedAt > REGISTER_OTP_TTL_MS;
}

export function verifyRegisterOtp(input: string, now = Date.now()): RegisterOtpVerifyResult {
  const session = readRegisterOtpSession();
  if (!session) return { status: 'expired' };
  if (session.attempts >= REGISTER_OTP_MAX_ATTEMPTS) return { status: 'locked' };
  if (isRegisterOtpExpired(session, now)) return { status: 'expired' };

  const code = input.replace(/\D/g, '');
  if (code === session.otpCode) {
    writeSession({ ...session, verified: true });
    return { status: 'ok' };
  }

  const attempts = session.attempts + 1;
  writeSession({ ...session, attempts });
  if (attempts >= REGISTER_OTP_MAX_ATTEMPTS) return { status: 'locked' };
  return { status: 'wrong', remaining: REGISTER_OTP_MAX_ATTEMPTS - attempts };
}

export function isRegisterPhoneVerified(): boolean {
  const session = readRegisterOtpSession();
  return Boolean(session?.verified);
}
