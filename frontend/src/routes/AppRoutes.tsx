import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import NotFoundPage from '../pages/error/NotFoundPage';
import DashboardLayout from '../components/layout/DashboardLayout';
import PlatformOverviewPage from '../pages/platform/PlatformOverviewPage';
import OrganizationsPage from '../pages/platform/OrganizationsPage';
import TenantAdminsPage from '../pages/platform/TenantAdminsPage';
import AuditLogsPage from '../pages/shared/AuditLogsPage';
import TenantOverviewPage from '../pages/tenant/TenantOverviewPage';
import RoutesManagementPage from '../pages/tenant/RoutesManagementPage';
import RouteFormPage from '../pages/tenant/RouteFormPage';
import RouteVersionsPage from '../pages/tenant/RouteVersionsPage';
import TenantSettingsPage from '../pages/tenant/TenantSettingsPage';
import RoutePlaygroundPage from '../pages/tenant/RoutePlaygroundPage';
import RouteTestConsolePage from '../pages/tenant/RouteTestConsolePage';
import LandingPage from '../pages/shared/LandingPage';
import SystemArchitecturePage from '../pages/shared/SystemArchitecturePage';
import PublicLayout from '../components/layout/PublicLayout';
import AboutDeveloperPage from '../pages/shared/AboutDeveloperPage';
import ApiDocsPage from '../pages/shared/ApiDocsPage';
import SystemStatusPage from '../pages/shared/SystemStatusPage';
import AppWakeWrapper from '../components/common/AppWakeWrapper';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <DashboardLayout role="PLATFORM_ADMIN" />,
    children: [
      { path: '/platform/dashboard', element: <PlatformOverviewPage /> },
      { path: '/platform/organizations', element: <OrganizationsPage /> },
      { path: '/platform/organizations/:organizationId/admins', element: <TenantAdminsPage /> },
      { path: '/platform/audit', element: <AuditLogsPage /> },
    ],
  },
  {
    element: <DashboardLayout role="TENANT_ADMIN" />,
    children: [
      { path: '/tenant/dashboard', element: <TenantOverviewPage /> },
      { path: '/tenant/routes', element: <RoutesManagementPage /> },
      { path: '/tenant/routes/new', element: <RouteFormPage /> },
      { path: '/tenant/routes/:id/edit', element: <RouteFormPage /> },
      { path: '/tenant/routes/:routeId/versions', element: <RouteVersionsPage /> },
      { path: '/tenant/playground', element: <RoutePlaygroundPage /> },
      { path: '/tenant/playground/:routeId/test', element: <RouteTestConsolePage /> },
      { path: '/tenant/settings', element: <TenantSettingsPage /> },
      { path: '/tenant/audit', element: <AuditLogsPage /> },
    ],
  },
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <LandingPage /> },
      { path: '/architecture', element: <SystemArchitecturePage /> },
      { path: '/about', element: <AboutDeveloperPage /> },
      { path: '/docs', element: <ApiDocsPage /> },
      { path: '/status', element: <SystemStatusPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter() {
  return (
    <AppWakeWrapper>
      <RouterProvider router={router} />
    </AppWakeWrapper>
  );
}