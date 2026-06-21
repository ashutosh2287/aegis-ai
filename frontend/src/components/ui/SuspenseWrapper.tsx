import { Suspense, type ReactNode } from 'react';
import { PageSkeleton } from './PageSkeleton';

export const SuspenseWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<PageSkeleton />}>
    {children}
  </Suspense>
);
