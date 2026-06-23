import { useAuthStore } from '../../store/authStore';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  Menu,
  BarChart2,
  FileText,
  Activity,
  Battery,
  LogOut,
  Dumbbell,
  MessageCircle,
  Apple,
  LineChart,
  Sparkles,
} from 'lucide-react';

export const Sidebar = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const isAuth = !!user;

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-64 bg-aegis-charcoal border-r border-aegis-border">
      <div className="flex items-center px-4 py-6">
        {user ? (
          <button
            onClick={() => navigate('/app/profile')}
            className="flex items-center gap-3 w-full text-left hover:opacity-80 transition-opacity"
          >
            <div className="h-10 w-10 bg-aegis-gold rounded-full flex items-center justify-center shrink-0">
              <span className="text-sm font-semibold text-aegis-black">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-aegis-muted truncate">{user.email}</p>
            </div>
          </button>
        ) : (
          <div className="h-10 w-10 bg-aegis-gold rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-aegis-black" />
          </div>
        )}
      </div>

      <nav className="mt-6 space-y-1 px-3" aria-label="Main navigation">
        {/* Overview */}
        <div className="px-3 pt-2">
          <p className="text-xs font-semibold text-aegis-muted uppercase">OVERVIEW</p>
        </div>
        <NavLink
          to="/app/dashboard"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <Menu className="mr-3 h-4 w-4" />
          Dashboard
        </NavLink>

        <NavLink
          to="/app/analytics"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <BarChart2 className="mr-3 h-4 w-4" />
          Analytics
        </NavLink>

        <NavLink
          to="/app/records"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <FileText className="mr-3 h-4 w-4" />
          Records
        </NavLink>

        {/* Training */}
        <div className="my-6 px-3">
          <p className="text-xs font-semibold text-aegis-muted uppercase">TRAINING</p>
        </div>
        <NavLink
          to="/app/workouts"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <Activity className="mr-3 h-4 w-4" />
          Workouts
        </NavLink>

        <NavLink
          to="/app/history"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <Battery className="mr-3 h-4 w-4" />
          History
        </NavLink>

        <NavLink
          to="/app/exercises"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <Dumbbell className="mr-3 h-4 w-4" />
          Exercises
        </NavLink>

        {/* AI */}
        <div className="my-6 px-3">
          <p className="text-xs font-semibold text-aegis-muted uppercase">AI</p>
        </div>
        <NavLink
          to="/app/ai/chat"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <MessageCircle className="mr-3 h-4 w-4" />
          AI Coach
        </NavLink>

        <NavLink
          to="/app/ai/workout"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <Dumbbell className="mr-3 h-4 w-4" />
          Workout Generator
        </NavLink>

        <NavLink
          to="/app/ai/nutrition"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <Apple className="mr-3 h-4 w-4" />
          Nutrition Planner
        </NavLink>

        <NavLink
          to="/app/ai/analysis"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <LineChart className="mr-3 h-4 w-4" />
          Progress Analysis
        </NavLink>

        <NavLink
          to="/app/ai/insights"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-aegis-gold/10 text-aegis-gold' : 'text-aegis-muted hover:text-white hover:bg-white/5'}
          `}
        >
          <Sparkles className="mr-3 h-4 w-4" />
          AI Insights
        </NavLink>
      </nav>

      {isAuth && (
        <div className="mt-auto pb-4 px-3 border-t border-aegis-border">
          <button
            onClick={handleLogout}
            className="flex w-items-center px-3 py-2 text-sm font-medium rounded-md text-aegis-muted hover:text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-2"
            aria-label="Sign out of your account"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
};