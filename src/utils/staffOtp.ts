import {
  DEMO_OTP_CODE,
  maskPhone,
  normalizePhone,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SEC,
  OTP_TTL_MS,
} from './forgotPassword';

export { DEMO_OTP_CODE, maskPhone, OTP_RESEND_COOLDOWN_SEC };

export type StaffOtpPurpose = 'create-staff' | 'change-phone';

export interface StaffOtpSession {
  phone: string;
  purpose: StaffOtpPurpose;
  otpCode: string;
  issuedAt: number;
  attempts: number;
}

export type StaffOtpVerifyResult =
  | { status: 'ok' }
  | { status: 'wrong'; remaining: number }
  | { status: 'expired' }
  | { status: 'locked' };

let staffOtpSession: StaffOtpSession | null = null;

export function startStaffOtpSession(phone: string, purpose: StaffOtpPurpose): StaffOtpSession {
  staffOtpSession = {
    phone: normalizePhone(phone),
    purpose,
    otpCode: DEMO_OTP_CODE,
    issuedAt: Date.now(),
    attempts: 0,
  };
  return staffOtpSession;
}

export function readStaffOtpSession(): StaffOtpSession | null {
  return staffOtpSession;
}

export function clearStaffOtpSession(): void {
  staffOtpSession = null;
}

export function resendStaffOtpSession(): StaffOtpSession | null {
  if (!staffOtpSession) return null;
  staffOtpSession = {
    ...staffOtpSession,
    otpCode: DEMO_OTP_CODE,
    issuedAt: Date.now(),
    attempts: 0,
  };
  return staffOtpSession;
}

export function isStaffOtpExpired(session: StaffOtpSession, now = Date.now()): boolean {
  return now - session.issuedAt > OTP_TTL_MS;
}

export function verifyStaffOtp(input: string, now = Date.now()): StaffOtpVerifyResult {
  if (!staffOtpSession) return { status: 'expired' };

  if (staffOtpSession.attempts >= OTP_MAX_ATTEMPTS) {
    return { status: 'locked' };
  }

  if (isStaffOtpExpired(staffOtpSession, now)) {
    return { status: 'expired' };
  }

  const code = input.replace(/\D/g, '');
  if (code === staffOtpSession.otpCode) {
    return { status: 'ok' };
  }

  staffOtpSession = {
    ...staffOtpSession,
    attempts: staffOtpSession.attempts + 1,
  };

  if (staffOtpSession.attempts >= OTP_MAX_ATTEMPTS) {
    return { status: 'locked' };
  }

  return { status: 'wrong', remaining: OTP_MAX_ATTEMPTS - staffOtpSession.attempts };
}
