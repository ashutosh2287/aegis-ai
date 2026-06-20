import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { SessionExpiredBanner } from '../components/SessionExpiredBanner';
import { MobileNav } from '../components/layout/MobileNav';

export const AppShell = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
        <Sidebar />
      </aside>
      {/* Main content */}
      <div className="flex-1 p-6 md:ml-64">
        <SessionExpiredBanner />
        <AnimatePresence mode="wait">
          <Outlet key={location.key} />
        </AnimatePresence>
      </div>
      {/* Mobile Nav */}
      <div className="block md:hidden">
        <MobileNav />
      </div>
    </div>
  );
};