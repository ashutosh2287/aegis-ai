import { NavLink } from 'react-router-dom';
import {
  Menu,
  Activity,
  BarChart2,
  TrendingUp,
  User,
} from 'lucide-react';

export const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around bg-aegis-charcoal border-t border-aegis-border" aria-label="Mobile navigation">
      <NavLink
        to="/app/dashboard"
        end
        className={({ isActive }) => `
          flex flex-col items-center px-2 py-1 text-sm font-medium
          ${isActive ? 'text-aegis-gold' : 'text-aegis-muted'}
        `}
      >
        <Menu className="h-4 w-4 mb-1" />
        Dashboard
      </NavLink>

      <NavLink
        to="/app/workouts"
        end
        className={({ isActive }) => `
          flex flex-col items-center px-2 py-1 text-sm font-medium
          ${isActive ? 'text-aegis-gold' : 'text-aegis-muted'}
        `}
      >
        <Activity className="h-4 w-4 mb-1" />
        Workouts
      </NavLink>

      <NavLink
        to="/app/analytics"
        end
        className={({ isActive }) => `
          flex flex-col items-center px-2 py-1 text-sm font-medium
          ${isActive ? 'text-aegis-gold' : 'text-aegis-muted'}
        `}
      >
        <BarChart2 className="h-4 w-4 mb-1" />
        Analytics
      </NavLink>

      <NavLink
        to="/app/insights"
        end
        className={({ isActive }) => `
          flex flex-col items-center px-2 py-1 text-sm font-medium
          ${isActive ? 'text-aegis-gold' : 'text-aegis-muted'}
        `}
      >
        <TrendingUp className="h-4 w-4 mb-1" />
        Insights
      </NavLink>

      <NavLink
        to="/app/profile"
        end
        className={({ isActive }) => `
          flex flex-col items-center px-2 py-1 text-sm font-medium
          ${isActive ? 'text-aegis-gold' : 'text-aegis-muted'}
        `}
      >
        <User className="h-4 w-4 mb-1" />
        Profile
      </NavLink>
    </nav>
  );
};