import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { verifyAdminAccess } from '../../lib/adminService';

export default function AdminGuard({ user, children }) {
  const [access, setAccess] = useState('checking');

  useEffect(() => {
    let active = true;
    if (!user) {
      setAccess('denied');
      return undefined;
    }
    verifyAdminAccess().then((allowed) => {
      if (active) setAccess(allowed ? 'allowed' : 'denied');
    });
    return () => { active = false; };
  }, [user]);

  if (access === 'checking') return <div className="min-h-screen bg-slate-950" />;
  if (access === 'denied') return <Navigate to="/dashboard" replace />;
  return children;
}
