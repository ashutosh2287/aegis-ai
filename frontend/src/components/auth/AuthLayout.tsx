import type { ReactNode } from 'react';
import { AuthHero } from './AuthHero';
import { AuthLogo } from './AuthLogo';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-aegis-black">
      {/* Left: Hero panel — hidden on mobile, visible lg+ */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <AuthHero />
      </div>

      {/* Right: Form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8 text-center">
            <AuthLogo className="justify-center" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
