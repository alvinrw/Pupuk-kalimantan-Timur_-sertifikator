import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) return null;
  
  const effectiveRole = user.role.replace(/Admin \d+/, 'Admin');
  if (!allowedRoles.includes(effectiveRole)) {
    return null;
  }

  return <>{children}</>;
}
