import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DriverRole } from '../types';

const DEFAULT_HOME: Record<DriverRole, string> = {
  'quote-rescue': '/home',
  'quote-only': '/quotes',
  'rescue-only': '/home',
};

export const RoleHomeRedirect: React.FC = () => {
  const { driverRole } = useApp();
  return <Navigate to={DEFAULT_HOME[driverRole]} replace />;
};

export const RoleGuard: React.FC<{
  allow: DriverRole[];
  children: React.ReactNode;
}> = ({ allow, children }) => {
  const { driverRole } = useApp();
  const location = useLocation();
  if (!allow.includes(driverRole)) {
    return <Navigate to={DEFAULT_HOME[driverRole]} replace state={{ from: location }} />;
  }
  return <>{children}</>;
};
