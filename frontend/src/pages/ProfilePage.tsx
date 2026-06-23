import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Calendar,
  Ruler,
  Bell,
  LogOut,
  Check,
  Target,
  Dumbbell,
  Flame,
  Mountain,
  Zap,
  Trophy,
  ChevronDown,
  ChevronUp,
  Save,
  Clock,
  Weight,
  Award,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { ErrorCard } from '../components/ui/ErrorCard';
import { ExperienceLevel } from '../lib/goals.types';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

const goalOptions = [
  { label: 'Build Muscle', icon: Dumbbell },
  { label: 'Gain Strength', icon: Mountain },
  { label: 'Lose Weight', icon: Flame },
  { label: 'Fundamentals', icon: Target },
  { label: 'Conditioning', icon: Zap },
  { label: 'Sport', icon: Trophy },
];

const equipmentOptions = [
  'Full gym',
  'Barbells',
  'Dumbbells',
  'Kettlebells',
  'Machines',
  'None of the above',
];

const experienceOptions: { label: string; value: ExperienceLevel }[] = [
  { label: 'New to weightlifting', value: ExperienceLevel.NEW },
  { label: 'A few months', value: ExperienceLevel.FEW_MONTHS },
  { label: 'About a year', value: ExperienceLevel.ONE_YEAR },
  { label: 'Several years', value: ExperienceLevel.YEARS },
  { label: 'Competitor', value: ExperienceLevel.COMPETITOR },
];

function EditPreferencesSection({
  profile,
  onSave,
  isSaving,
}: {
  profile: { goals: string[]; equipment: string[]; experience_level: string | null; target_days_per_week: number | null };
  onSave: (data: { goals: string[]; equipment: string[]; experience_level: string; target_days_per_week: number }) => void;
  isSaving: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [goals, setGoals] = useState<string[]>(profile.goals ?? []);
  const [equipment, setEquipment] = useState<string[]>(profile.equipment ?? []);
  const [experienceLevel, setExperienceLevel] = useState<string>(profile.experience_level ?? ExperienceLevel.NEW);
  const [frequency, setFrequency] = useState<number>(profile.target_days_per_week ?? 3);

  useEffect(() => {
    setGoals(profile.goals ?? []);
    setEquipment(profile.equipment ?? []);
    setExperienceLevel(profile.experience_level ?? ExperienceLevel.NEW);
    setFrequency(profile.target_days_per_week ?? 3);
  }, [profile]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleEquipment = (equip: string) => {
    setEquipment((prev) =>
      prev.includes(equip) ? prev.filter((e) => e !== equip) : [...prev, equip]
    );
  };

  const handleSave = () => {
    onSave({ goals, equipment, experience_level: experienceLevel, target_days_per_week: frequency });
  };

  const hasChanges =
    JSON.stringify(goals) !== JSON.stringify(profile.goals ?? []) ||
    JSON.stringify(equipment) !== JSON.stringify(profile.equipment ?? []) ||
    experienceLevel !== (profile.experience_level ?? ExperienceLevel.NEW) ||
    frequency !== (profile.target_days_per_week ?? 3);

  return (
    <div className="bg-aegis-charcoal rounded-2xl border border-aegis-border overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-aegis-gold/10 rounded-xl flex items-center justify-center">
            <Settings className="h-5 w-5 text-aegis-gold" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">Training preferences</p>
            <p className="text-xs text-aegis-muted">Goals, equipment, experience & frequency</p>
          </div>
        </div>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${expanded ? 'bg-white/5' : ''}`}>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-aegis-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-aegis-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-5 pb-5 space-y-6 border-t border-aegis-border pt-5"
        >
          {/* Goals */}
          <div>
            <p className="text-sm font-medium text-white mb-3">Goals</p>
            <div className="grid grid-cols-2 gap-2">
              {goalOptions.map(({ label, icon: Icon }) => {
                const selected = goals.includes(label);
                return (
                  <button
                    key={label}
                    onClick={() => toggleGoal(label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'border-aegis-gold/50 bg-aegis-gold/5 text-white'
                        : 'border-aegis-border bg-aegis-dark text-aegis-muted hover:border-aegis-muted/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${selected ? 'text-aegis-gold' : ''}`} />
                    <span className="truncate">{label}</span>
                    {selected && <Check className="h-3.5 w-3.5 text-aegis-gold ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <p className="text-sm font-medium text-white mb-3">Equipment</p>
            <div className="space-y-1.5">
              {equipmentOptions.map((equip) => {
                const selected = equipment.includes(equip);
                return (
                  <button
                    key={equip}
                    onClick={() => toggleEquipment(equip)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'border-aegis-gold/50 bg-aegis-gold/5 text-white'
                        : 'border-aegis-border bg-aegis-dark text-aegis-muted hover:border-aegis-muted/50'
                    }`}
                  >
                    <span>{equip}</span>
                    {selected && <Check className="h-3.5 w-3.5 text-aegis-gold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <p className="text-sm font-medium text-white mb-3">Experience level</p>
            <div className="space-y-1.5">
              {experienceOptions.map(({ label, value }) => {
                const selected = experienceLevel === value;
                return (
                  <button
                    key={value}
                    onClick={() => setExperienceLevel(value)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all ${
                      selected
                        ? 'border-aegis-gold/50 bg-aegis-gold/5 text-white'
                        : 'border-aegis-border bg-aegis-dark text-aegis-muted hover:border-aegis-muted/50'
                    }`}
                  >
                    <span>{label}</span>
                    {selected && <Check className="h-3.5 w-3.5 text-aegis-gold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Frequency */}
          <div>
            <p className="text-sm font-medium text-white mb-3">Weekly frequency goal</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  onClick={() => setFrequency(days)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    frequency === days
                      ? 'border-aegis-gold bg-aegis-gold/10 text-aegis-gold'
                      : 'border-aegis-border bg-aegis-dark text-aegis-muted hover:border-aegis-muted/50'
                  }`}
                >
                  {days}
                </button>
              ))}
            </div>
            <p className="text-xs text-aegis-muted mt-2">
              {frequency} {frequency === 1 ? 'day' : 'days'} per week
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-aegis-gold text-aegis-black font-semibold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-aegis-gold-light active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save preferences'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

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
      <div className="bg-aegis-charcoal rounded-2xl border border-aegis-border p-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-20 w-20 bg-aegis-border rounded-full animate-pulse mb-4" />
          <div className="h-5 bg-aegis-border rounded w-40 animate-pulse mb-2" />
          <div className="h-4 bg-aegis-dark rounded w-56 animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4">
            <div className="h-4 bg-aegis-border rounded w-16 animate-pulse mb-2" />
            <div className="h-6 bg-aegis-dark rounded w-12 animate-pulse" />
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

  useEffect(() => {
    if (profile) {
      setUnits(profile.preferred_units ?? 'metric');
      setNotifications(profile.notification_preferences ?? {});
    }
  }, [profile]);

  const handleUnitsChange = (value: string) => {
    setUnits(value);
    updateProfile.mutate({ preferred_units: value });
  };

  const handleNotificationToggle = (key: string) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    updateProfile.mutate({ notification_preferences: updated });
  };

  const handlePreferencesSave = (data: { goals: string[]; equipment: string[]; experience_level: string; target_days_per_week: number }) => {
    updateProfile.mutate(data);
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
  const experienceLabel = experienceOptions.find((e) => e.value === profile?.experience_level)?.label || profile?.experience_level;
  const targetDays = profile?.target_days_per_week;
  const weight = profile?.weight;
  const weightUnit = profile?.weight_unit === 'imperial' ? 'lbs' : 'kg';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5"
    >
      {/* Profile Header */}
      <motion.div variants={sectionVariants} className="bg-aegis-charcoal rounded-2xl border border-aegis-border overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-aegis-gold/20 via-aegis-gold/5 to-transparent" />
        <div className="px-6 pb-6 -mt-10">
          <div className="flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-aegis-gold rounded-full flex items-center justify-center ring-4 ring-aegis-charcoal mb-3">
              <span className="text-xl font-bold text-aegis-black">
                {getInitials(firstName, lastName)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {firstName} {lastName}
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <Mail className="h-3.5 w-3.5 text-aegis-muted" />
              <p className="text-sm text-aegis-muted">{email}</p>
            </div>
            {memberSince && (
              <div className="flex items-center gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5 text-aegis-muted" />
                <p className="text-xs text-aegis-muted">Member since {formatDate(memberSince)}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={sectionVariants} className="grid grid-cols-3 gap-3">
        {experienceLabel && (
          <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 text-center">
            <Award className="h-4 w-4 text-aegis-gold mx-auto mb-1.5" />
            <p className="text-[11px] text-aegis-muted uppercase tracking-wide">Level</p>
            <p className="text-sm font-semibold text-white mt-0.5 truncate">{experienceLabel}</p>
          </div>
        )}
        {targetDays && (
          <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 text-center">
            <Clock className="h-4 w-4 text-aegis-gold mx-auto mb-1.5" />
            <p className="text-[11px] text-aegis-muted uppercase tracking-wide">Frequency</p>
            <p className="text-sm font-semibold text-white mt-0.5">{targetDays}x/week</p>
          </div>
        )}
        {weight && (
          <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 text-center">
            <Weight className="h-4 w-4 text-aegis-gold mx-auto mb-1.5" />
            <p className="text-[11px] text-aegis-muted uppercase tracking-wide">Weight</p>
            <p className="text-sm font-semibold text-white mt-0.5">{weight} {weightUnit}</p>
          </div>
        )}
      </motion.div>

      {/* Goals Tags */}
      {profile?.goals && profile.goals.length > 0 && (
        <motion.div variants={sectionVariants} className="bg-aegis-charcoal rounded-2xl border border-aegis-border p-5">
          <p className="text-sm font-medium text-white mb-3">Goals</p>
          <div className="flex flex-wrap gap-2">
            {profile.goals.map((goal) => (
              <span
                key={goal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-aegis-gold/10 text-aegis-gold text-xs font-medium border border-aegis-gold/20"
              >
                {goal}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Equipment Tags */}
      {profile?.equipment && profile.equipment.length > 0 && (
        <motion.div variants={sectionVariants} className="bg-aegis-charcoal rounded-2xl border border-aegis-border p-5">
          <p className="text-sm font-medium text-white mb-3">Equipment</p>
          <div className="flex flex-wrap gap-2">
            {profile.equipment.map((equip) => (
              <span
                key={equip}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 text-white/70 text-xs font-medium border border-aegis-border"
              >
                {equip}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Edit Preferences */}
      {profile && (
        <motion.div variants={sectionVariants}>
          <EditPreferencesSection
            profile={profile}
            onSave={handlePreferencesSave}
            isSaving={updateProfile.isPending}
          />
        </motion.div>
      )}

      {/* Settings */}
      <motion.div variants={sectionVariants} className="bg-aegis-charcoal rounded-2xl border border-aegis-border overflow-hidden">
        {/* Units Preference */}
        <div className="flex items-center justify-between p-5 border-b border-aegis-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-aegis-dark rounded-xl flex items-center justify-center">
              <Ruler className="h-5 w-5 text-aegis-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Units</p>
              <p className="text-xs text-aegis-muted">Measurement system</p>
            </div>
          </div>
          <select
            value={units}
            onChange={(e) => handleUnitsChange(e.target.value)}
            className="text-sm font-medium text-white bg-aegis-dark border border-aegis-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-1"
          >
            <option value="metric">Metric (kg)</option>
            <option value="imperial">Imperial (lbs)</option>
          </select>
        </div>

        {/* Notifications */}
        <div className="p-5 border-b border-aegis-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 bg-aegis-dark rounded-xl flex items-center justify-center">
              <Bell className="h-5 w-5 text-aegis-muted" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Notifications</p>
              <p className="text-xs text-aegis-muted">Manage alerts</p>
            </div>
          </div>
          <div className="space-y-3 ml-[52px]">
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
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-aegis-gold focus:ring-offset-2 ${
                    notifications[key] ? 'bg-aegis-gold' : 'bg-aegis-border'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full group"
          >
            <div className="h-10 w-10 bg-red-900/20 rounded-xl flex items-center justify-center group-hover:bg-red-900/30 transition-colors">
              <LogOut className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-sm font-medium text-red-400">Sign out</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
