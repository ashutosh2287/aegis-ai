import { useReducer, useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Target,
  Trophy,
  Zap,
  Mountain,
  Gauge,
  Scale,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { onboardingService, type OnboardingData } from '../lib/onboarding.service';
import { ExperienceLevel, WeightUnit } from '../lib/goals.types';

const TOTAL_STEPS = 5;

const slideVariants = {
  enter: { x: 300, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 },
};

interface OnboardingState {
  goals: string[];
  equipment: string[];
  experience_level: ExperienceLevel | null;
  target_days_per_week: number | null;
  weight: number;
  weight_unit: WeightUnit;
}

type OnboardingAction =
  | { type: 'TOGGLE_GOAL'; goal: string }
  | { type: 'TOGGLE_EQUIPMENT'; equipment: string }
  | { type: 'SET_EXPERIENCE'; level: ExperienceLevel }
  | { type: 'SET_FREQUENCY'; days: number }
  | { type: 'SET_WEIGHT'; weight: number }
  | { type: 'SET_WEIGHT_UNIT'; unit: WeightUnit };

function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case 'TOGGLE_GOAL': {
      const goals = state.goals.includes(action.goal)
        ? state.goals.filter((g) => g !== action.goal)
        : [...state.goals, action.goal];
      return { ...state, goals };
    }
    case 'TOGGLE_EQUIPMENT': {
      const equipment = state.equipment.includes(action.equipment)
        ? state.equipment.filter((e) => e !== action.equipment)
        : [...state.equipment, action.equipment];
      return { ...state, equipment };
    }
    case 'SET_EXPERIENCE':
      return { ...state, experience_level: action.level };
    case 'SET_FREQUENCY':
      return { ...state, target_days_per_week: action.days };
    case 'SET_WEIGHT':
      return { ...state, weight: action.weight };
    case 'SET_WEIGHT_UNIT':
      return { ...state, weight_unit: action.unit };
    default:
      return state;
  }
}

const initialState: OnboardingState = {
  goals: [],
  equipment: [],
  experience_level: null,
  target_days_per_week: null,
  weight: 70,
  weight_unit: WeightUnit.METRIC,
};

function isStepValid(step: number, state: OnboardingState): boolean {
  switch (step) {
    case 0: return state.goals.length > 0;
    case 1: return state.equipment.length > 0;
    case 2: return state.experience_level !== null;
    case 3: return state.target_days_per_week !== null;
    case 4: return true;
    default: return true;
  }
}

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

const experienceOptions: { label: string; value: ExperienceLevel; bars: number }[] = [
  { label: 'New to weightlifting', value: ExperienceLevel.NEW, bars: 1 },
  { label: 'A few months', value: ExperienceLevel.FEW_MONTHS, bars: 2 },
  { label: 'About a year', value: ExperienceLevel.ONE_YEAR, bars: 3 },
  { label: 'Several years', value: ExperienceLevel.YEARS, bars: 4 },
  { label: 'Competitor', value: ExperienceLevel.COMPETITOR, bars: 4 },
];

const frequencyLabels: Record<number, string> = {
  1: 'Good',
  2: 'Promising',
  3: 'Recommended',
  4: 'Recommended',
  5: 'Recommended',
  6: 'Impressive',
  7: 'Unstoppable',
};

function SignalBars({ count, selected }: { count: number; selected: boolean }) {
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-200 ${
            i <= count
              ? selected ? 'bg-aegis-gold' : 'bg-aegis-gold/60'
              : 'bg-aegis-border'
          }`}
          style={{ height: `${40 + i * 20}%` }}
        />
      ))}
    </div>
  );
}

function WeightPicker({
  value,
  unit,
  onChange,
}: {
  value: number;
  unit: WeightUnit;
  onChange: (v: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 48;
  const visibleCount = 5;
  const min = unit === WeightUnit.METRIC ? 30 : 66;
  const max = unit === WeightUnit.METRIC ? 200 : 440;
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const scrollToValue = useCallback(
    (val: number, smooth = true) => {
      const container = containerRef.current;
      if (!container) return;
      const idx = val - min;
      const offset = idx * itemHeight - (container.clientHeight / 2 - itemHeight / 2);
      container.scrollTo({ top: offset, behavior: smooth ? 'smooth' : 'instant' });
    },
    [min, itemHeight],
  );

  useEffect(() => {
    scrollToValue(value, false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const centerOffset = scrollTop + container.clientHeight / 2 - itemHeight / 2;
      const idx = Math.round(centerOffset / itemHeight);
      const clamped = Math.max(min, Math.min(max, min + idx));
      if (clamped !== value) onChange(clamped);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [value, min, max, itemHeight, onChange]);

  const unitLabel = unit === WeightUnit.METRIC ? 'kg' : 'lbs';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center">
        <span className="text-5xl font-bold text-white tabular-nums">{value}</span>
        <span className="text-lg text-aegis-muted ml-2">{unitLabel}</span>
      </div>
      <div
        ref={containerRef}
        className="w-48 h-60 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="h-[calc(50%-24px)]" />
        {values.map((v) => (
          <div
            key={v}
            className={`h-12 flex items-center justify-center snap-center transition-all duration-150 ${
              v === value ? 'text-white text-xl font-semibold' : 'text-aegis-muted/40 text-lg'
            }`}
            onClick={() => {
              onChange(v);
              scrollToValue(v);
            }}
          >
            {v}
          </div>
        ))}
        <div className="h-[calc(50%-24px)]" />
      </div>
    </div>
  );
}

function StepGoals({ state, dispatch }: { state: OnboardingState; dispatch: React.Dispatch<OnboardingAction> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">What are your goals?</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {goalOptions.map(({ label, icon: Icon }) => {
          const selected = state.goals.includes(label);
          return (
            <button
              key={label}
              onClick={() => dispatch({ type: 'TOGGLE_GOAL', goal: label })}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-200 ${
                selected
                  ? 'border-white bg-white/5'
                  : 'border-aegis-border bg-aegis-charcoal hover:border-aegis-muted/50'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  selected ? 'bg-aegis-gold/20' : 'bg-aegis-dark'
                }`}
              >
                <Icon className={`h-6 w-6 ${selected ? 'text-aegis-gold' : 'text-aegis-muted'}`} />
              </div>
              <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-aegis-muted'}`}>
                {label}
              </span>
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-aegis-gold flex items-center justify-center">
                  <Check className="h-3 w-3 text-aegis-black" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepEquipment({ state, dispatch }: { state: OnboardingState; dispatch: React.Dispatch<OnboardingAction> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">What equipment do you have?</h2>
      </div>
      <div className="space-y-2">
        {equipmentOptions.map((equip) => {
          const selected = state.equipment.includes(equip);
          return (
            <button
              key={equip}
              onClick={() => dispatch({ type: 'TOGGLE_EQUIPMENT', equipment: equip })}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${
                selected
                  ? 'border-white bg-white text-aegis-black'
                  : 'border-aegis-border bg-aegis-charcoal hover:border-aegis-muted/50'
              }`}
            >
              <span className={`font-medium ${selected ? 'text-aegis-black' : 'text-white'}`}>
                {equip}
              </span>
              {selected && (
                <div className="w-6 h-6 rounded-full bg-aegis-black flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepExperience({ state, dispatch }: { state: OnboardingState; dispatch: React.Dispatch<OnboardingAction> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">How experienced are you with weightlifting?</h2>
      </div>
      <div className="space-y-2">
        {experienceOptions.map(({ label, value, bars }) => {
          const selected = state.experience_level === value;
          return (
            <button
              key={value}
              onClick={() => dispatch({ type: 'SET_EXPERIENCE', level: value })}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${
                selected
                  ? 'border-white bg-white/5'
                  : 'border-aegis-border bg-aegis-charcoal hover:border-aegis-muted/50'
              }`}
            >
              <span className={`font-medium ${selected ? 'text-white' : 'text-aegis-muted'}`}>
                {label}
              </span>
              <SignalBars count={bars} selected={selected} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepFrequency({ state, dispatch }: { state: OnboardingState; dispatch: React.Dispatch<OnboardingAction> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">How many days a week would you like to work out?</h2>
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5, 6, 7].map((days) => {
          const selected = state.target_days_per_week === days;
          return (
            <button
              key={days}
              onClick={() => dispatch({ type: 'SET_FREQUENCY', days })}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-xl border transition-all duration-200 ${
                selected
                  ? 'border-white bg-white/5'
                  : 'border-aegis-border bg-aegis-charcoal hover:border-aegis-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    selected
                      ? 'bg-aegis-gold text-aegis-black'
                      : 'bg-aegis-dark text-aegis-muted'
                  }`}
                >
                  {days}
                </div>
                <span className={`font-medium ${selected ? 'text-white' : 'text-aegis-muted'}`}>
                  {days === 1 ? 'day' : 'days'} per week
                </span>
              </div>
              <span
                className={`text-sm font-medium ${
                  selected ? 'text-aegis-gold' : 'text-aegis-muted/60'
                }`}
              >
                {frequencyLabels[days]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepBodyweight({ state, dispatch }: { state: OnboardingState; dispatch: React.Dispatch<OnboardingAction> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">How much do you weigh?</h2>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex bg-aegis-dark rounded-full p-1 border border-aegis-border">
          <button
            onClick={() => {
              if (state.weight_unit !== WeightUnit.METRIC) {
                const converted = Math.round(state.weight * 0.453592);
                dispatch({ type: 'SET_WEIGHT_UNIT', unit: WeightUnit.METRIC });
                dispatch({ type: 'SET_WEIGHT', weight: converted });
              }
            }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              state.weight_unit === WeightUnit.METRIC
                ? 'bg-aegis-gold text-aegis-black'
                : 'text-aegis-muted hover:text-white'
            }`}
          >
            Metric (kg)
          </button>
          <button
            onClick={() => {
              if (state.weight_unit !== WeightUnit.IMPERIAL) {
                const converted = Math.round(state.weight * 2.20462);
                dispatch({ type: 'SET_WEIGHT_UNIT', unit: WeightUnit.IMPERIAL });
                dispatch({ type: 'SET_WEIGHT', weight: converted });
              }
            }}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              state.weight_unit === WeightUnit.IMPERIAL
                ? 'bg-aegis-gold text-aegis-black'
                : 'text-aegis-muted hover:text-white'
            }`}
          >
            Imperial (lbs)
          </button>
        </div>
      </div>

      <div className="flex justify-center py-4">
        <Scale className="h-8 w-8 text-aegis-gold/30" />
      </div>

      <WeightPicker
        value={state.weight}
        unit={state.weight_unit}
        onChange={(v) => dispatch({ type: 'SET_WEIGHT', weight: v })}
      />
    </div>
  );
}

const steps = [StepGoals, StepEquipment, StepExperience, StepFrequency, StepBodyweight];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const [step, setStep] = useState(0);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isFirst = step === 0;
  const isLast = step === TOTAL_STEPS - 1;
  const canContinue = isStepValid(step, state);

  const goNext = () => {
    if (!canContinue) return;
    if (isLast) {
      handleSubmit();
      return;
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onboardingService.completeOnboarding({
        goals: state.goals,
        equipment: state.equipment,
        experience_level: state.experience_level!,
        target_days_per_week: state.target_days_per_week!,
        weight: state.weight,
        weight_unit: state.weight_unit,
      });
      setOnboarded(true);
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to save. Please try again.');
      setIsSubmitting(false);
    }
  };

  const StepComponent = steps[step];
  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-aegis-black flex flex-col">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col px-4 py-6 sm:py-10">
        <div className="flex items-center gap-4 mb-2">
          {!isFirst && (
            <button
              onClick={goBack}
              className="w-10 h-10 rounded-full border border-aegis-border flex items-center justify-center text-aegis-muted hover:text-white hover:border-aegis-muted transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 h-1.5 bg-aegis-charcoal rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-aegis-gold rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-6 sm:py-10">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <StepComponent state={state} dispatch={dispatch} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-4">
          {submitError && (
            <p className="text-sm text-red-400 text-center mb-3">{submitError}</p>
          )}
          <button
            onClick={goNext}
            disabled={!canContinue || isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-aegis-gold text-aegis-black font-semibold text-base transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-aegis-gold-light active:scale-[0.98]"
          >
            {isSubmitting ? (
              'Saving...'
            ) : isLast ? (
              'Get Started'
            ) : (
              <>
                Continue
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
