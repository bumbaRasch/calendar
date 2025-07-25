import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import MainLayout from '../components/MainLayout';
import { GlobalErrorBoundary } from '../components/ErrorBoundaries';

export const Route = createRootRoute({
  component: () => (
    <GlobalErrorBoundary>
      <MainLayout>
        <Outlet />
      </MainLayout>
      <TanStackRouterDevtools />
    </GlobalErrorBoundary>
  ),
});
