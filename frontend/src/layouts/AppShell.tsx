import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from '../components/layout/Sidebar';
import { SessionExpiredBanner } from '../components/SessionExpiredBanner';
import { MobileNav } from '../components/layout/MobileNav';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';

export const AppShell = () => {
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        const profile = response.data;
        useAuthStore.setState((state) => ({
          user: state.user
            ? {
                ...state.user,
                isOnboarded: !!profile.onboarding_completed_at,
                goals: profile.goals ?? [],
                equipment: profile.equipment ?? [],
                experienceLevel: profile.experience_level ?? null,
                targetDaysPerWeek: profile.target_days_per_week ?? null,
              }
            : null,
        }));
      } catch {
        // Silently fail - profile data will be stale but app still works
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-aegis-black">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-0 h-screen bg-aegis-charcoal border-r border-aegis-border">
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