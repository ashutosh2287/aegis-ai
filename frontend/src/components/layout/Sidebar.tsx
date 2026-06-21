import { useAuthStore } from '../../store/authStore';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  User,
  Menu,
  BarChart2,
  FileText,
  Activity,
  Battery,
  TrendingUp,
  Target,
  LogOut,
  Dumbbell,
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
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="flex items-center px-4 py-6">
        {user ? (
          <>
            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="ml-3 space-y-1">
              <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </>
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
        )}
      </div>

      <nav className="mt-6 space-y-1 px-3" aria-label="Main navigation">
        {/* Overview */}
        <div className="px-3 pt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase">OVERVIEW</p>
        </div>
        <NavLink
          to="/app/dashboard"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
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
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
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
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
          `}
        >
          <FileText className="mr-3 h-4 w-4" />
          Records
        </NavLink>

        {/* Training */}
        <div className="my-6 px-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">TRAINING</p>
        </div>
        <NavLink
          to="/app/workouts"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
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
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
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
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
          `}
        >
          <Dumbbell className="mr-3 h-4 w-4" />
          Exercises
        </NavLink>

        {/* AI */}
        <div className="my-6 px-3">
          <p className="text-xs font-semibold text-gray-500 uppercase">AI</p>
        </div>
        <NavLink
          to="/app/insights"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
          `}
        >
          <TrendingUp className="mr-3 h-4 w-4" />
          Insights
        </NavLink>

        <NavLink
          to="/app/goals"
          end
          className={({ isActive }) => `
            flex items-center px-3 py-2 text-sm font-medium rounded-md
            ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'}
          `}
        >
          <Target className="mr-3 h-4 w-4" />
          Goals
        </NavLink>
      </nav>

      {isAuth && (
        <div className="mt-auto pb-4 px-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex w-items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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