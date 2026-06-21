import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Ruler, Bell, Edit3, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { ErrorCard } from '../components/ui/ErrorCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-aegis-border rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 bg-aegis-border rounded w-40 animate-pulse" />
            <div className="h-4 bg-aegis-dark rounded w-56 animate-pulse" />
            <div className="h-3 bg-aegis-dark rounded w-32 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="h-4 bg-aegis-border rounded w-32 animate-pulse" />
            <div className="h-4 bg-aegis-dark rounded w-24 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { data: profile, isLoading, isError, error, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const [units, setUnits] = useState<string>(profile?.preferred_units ?? 'metric');
  const [notifications, setNotifications] = useState(profile?.notification_preferences ?? {});

  const handleUnitsChange = (value: string) => {
    setUnits(value);
    updateProfile.mutate({ preferred_units: value });
  };

  const handleNotificationToggle = (key: string) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateProfile.mutate({ notification_preferences: updated });
  };

  const handleSignOut = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorCard
          title="Failed to load profile"
          message={error?.message || 'Could not fetch your profile.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';
  const email = user?.email ?? '';
  const memberSince = profile?.created_at;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6"
    >
      {/* Profile Header */}
      <motion.div variants={sectionVariants} className="bg-aegis-charcoal rounded-xl border border-aegis-border p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-aegis-gold rounded-full flex items-center justify-center shrink-0">
            <span className="text-lg font-semibold text-aegis-black">
              {getInitials(firstName, lastName)}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {firstName} {lastName}
            </h2>
            <p className="text-sm text-aegis-muted truncate">{email}</p>
            {memberSince && (
              <p className="text-xs text-aegis-muted mt-1">Member since {formatDate(memberSince)}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Settings */}
      <motion.div variants={sectionVariants} className="bg-aegis-charcoal rounded-xl border border-aegis-border divide-y divide-aegis-border">
        {/* Units Preference */}
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-aegis-dark rounded-lg flex items-center justify-center">
              <Ruler className="h-4 w-4 text-aegis-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Units</p>
              <p className="text-xs text-aegis-muted">Choose your preferred measurement system</p>
            </div>
          </div>
          <select
            value={units}
            onChange={(e) => handleUnitsChange(e.target.value)}
            className="text-sm font-medium text-white bg-aegis-dark border border-aegis-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-1"
          >
            <option value="metric">Metric (kg)</option>
            <option value="imperial">Imperial (lbs)</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 bg-aegis-dark rounded-lg flex items-center justify-center">
              <Bell className="h-4 w-4 text-aegis-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Notifications</p>
              <p className="text-xs text-aegis-muted">Manage your notification preferences</p>
            </div>
          </div>
          <div className="space-y-3 ml-12">
            {[
              { key: 'workout_reminders', label: 'Workout reminders' },
              { key: 'weekly_summary', label: 'Weekly summary' },
              { key: 'pr_celebrations', label: 'PR celebrations' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-aegis-muted">{label}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!notifications[key]}
                  onClick={() => handleNotificationToggle(key)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-2 ${
                    notifications[key] ? 'bg-aegis-gold' : 'bg-aegis-border'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications[key] ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* Edit Profile */}
        <div className="p-5">
          <button
            onClick={() => {/* TODO: open edit profile modal */}}
            className="flex items-center gap-3 w-full"
          >
            <div className="h-9 w-9 bg-aegis-dark rounded-lg flex items-center justify-center">
              <Edit3 className="h-4 w-4 text-aegis-muted" />
            </div>
            <span className="text-sm font-medium text-white">Edit profile</span>
          </button>
        </div>

        {/* Sign Out */}
        <div className="p-5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full"
          >
            <div className="h-9 w-9 bg-red-900/30 rounded-lg flex items-center justify-center">
              <LogOut className="h-4 w-4 text-red-400" />
            </div>
            <span className="text-sm font-medium text-red-400">Sign out</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
