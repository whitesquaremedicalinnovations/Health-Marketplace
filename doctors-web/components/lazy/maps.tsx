'use client';

import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui/loading';

// Lazy load Google Maps components
export const ReusableMap = dynamic(
  () => import('@/components/ui/reusable-map'),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <Loading variant="default" text="Loading map..." />
      </div>
    ),
    ssr: false
  }
);

export const ClinicSearchMap = dynamic(
  () => import('@/components/ui/clinic-search-map'),
  {
    loading: () => (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <Loading variant="default" text="Loading clinic map..." />
      </div>
    ),
    ssr: false
  }
);

export const SimpleClinicMap = dynamic(
  () => import('@/components/ui/simple-clinic-map'),
  {
    loading: () => (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <Loading variant="default" text="Loading map..." />
      </div>
    ),
    ssr: false
  }
);

export const OnboardingMapSection = dynamic(
  () => import('@/components/onboarding-map-section'),
  {
    loading: () => (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <Loading variant="default" text="Loading location picker..." />
      </div>
    ),
    ssr: false
  }
);

// Lazy load address autocomplete
export const AddressAutocomplete = dynamic(
  () => import('@/components/ui/address-autocomplete'),
  {
    loading: () => (
      <div className="w-full h-10 bg-gray-100 rounded-md animate-pulse" />
    ),
    ssr: false
  }
); 