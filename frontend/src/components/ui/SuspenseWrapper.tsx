import { Suspense, type ReactNode } from 'react';

export const SuspenseWrapper = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<div className="p-6"><div className="h-8 bg-gray-200 rounded w-48 animate-pulse" /></div>}>
    {children}
  </Suspense>
);
