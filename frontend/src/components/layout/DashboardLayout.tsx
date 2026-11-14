import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';

interface DashboardLayoutProps {
  role: 'PLATFORM_ADMIN' | 'TENANT_ADMIN';
}

export default function DashboardLayout({ role }: DashboardLayoutProps) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, role: userRole } = useAuth();

  if (!isAuthenticated || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== role) {
    const fallbackPath = userRole === 'PLATFORM_ADMIN' ? '/platform/dashboard' : '/tenant/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">

      <Sidebar role={role} isMobileOpen={isMobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 min-h-screen">
        <Header setMobileOpen={setMobileOpen} role={role} />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto flex flex-col min-h-[calc(100vh-9rem)]">
          <div className="flex-1 flex flex-col">
            <Outlet />
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}