import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { SessionExpiredBanner } from '../components/SessionExpiredBanner';
import { MobileNav } from '../components/layout/MobileNav';

export const AppShell = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-0 h-screen bg-white border-r border-gray-200">
        <Sidebar />
      </aside>
      {/* Main content */}
      <div className="flex-1 p-4 sm:p-6 pb-20 md:pb-6">
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