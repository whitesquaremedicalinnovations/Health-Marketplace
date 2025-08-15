'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui/loading';

// Lazy load the dashboard component
const DashboardComponent = dynamic(
  () => import('@/app/(protected)/dashboard/page'),
  {
    loading: () => <Loading variant="page" text="Loading dashboard..." />,
    ssr: false // Disable SSR for dashboard since it requires user data
  }
);

export { DashboardComponent as Dashboard }; 