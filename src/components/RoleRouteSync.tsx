import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { DriverRole } from '../types';

const HOME: Record<DriverRole, string> = {
  'quote-rescue': '/home',
  'quote-only': '/quotes',
  'rescue-only': '/home',
};

const ALLOWED: Record<DriverRole, string[]> = {
  'quote-rescue': ['/home', '/quotes', '/activity', '/notifications', '/settings', '/orders', '/jobs', '/change-password', '/extra-costs', '/payment-wait', '/payment-success', '/onboarding'],
  'quote-only': ['/quotes', '/activity', '/notifications', '/settings', '/orders', '/change-password', '/onboarding'],
  'rescue-only': ['/home', '/activity', '/settings', '/orders', '/jobs', '/change-password', '/extra-costs', '/payment-wait', '/payment-success', '/notifications', '/onboarding'],
};

const PUBLIC_PATHS = [
  '/login',
  '/sign-in',
  '/forgot-password',
  '/otp',
  '/new-password',
  '/account-locked',
  '/register-quick-service',
];

export const RoleRouteSync: React.FC = () => {
  const { driverRole } = useApp();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  React.useEffect(() => {
    if (!isLoggedIn) return;
    if (pathname === '/' || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return;

    const allowed = ALLOWED[driverRole].some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    if (!allowed) {
      navigate(HOME[driverRole], { replace: true });
    }
  }, [driverRole, pathname, navigate, isLoggedIn]);

  return null;
};
