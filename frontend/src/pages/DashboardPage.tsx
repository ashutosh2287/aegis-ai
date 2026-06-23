import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Dumbbell, ArrowRight, Sparkles } from 'lucide-react';
import { DashboardSummaryCards } from '../components/dashboard/DashboardSummaryCards';
import { WeeklyPerformanceChart } from '../components/dashboard/WeeklyPerformanceChart';
import { StrengthProgressWidget } from '../components/dashboard/StrengthProgressWidget';
import { ConsistencyGrid } from '../components/dashboard/ConsistencyGrid';
import { GoalsSnapshot } from '../components/dashboard/GoalsSnapshot';
import { SectionErrorBoundary } from '../components/dashboard/SectionErrorBoundary';
import { useAuthStore } from '../store/authStore';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function BeginnerWelcome() {
  return (
    <motion.div
      variants={sectionVariants}
      className="bg-gradient-to-br from-aegis-charcoal to-aegis-dark rounded-xl border border-aegis-gold/20 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-aegis-gold/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-6 w-6 text-aegis-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-white mb-1">Welcome to Aegis AI</h2>
          <p className="text-sm text-aegis-muted mb-4">
            Start with a simple full-body workout to learn the fundamentals.
            We recommend 3 sessions per week with at least one rest day between sessions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/app/workout-builder"
              className="inline-flex items-center gap-2 px-4 py-2 bg-aegis-gold text-aegis-black text-sm font-semibold rounded-lg hover:bg-aegis-gold-light transition-colors"
            >
              <Dumbbell className="h-4 w-4" />
              Build your first workout
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/app/exercises"
              className="inline-flex items-center gap-2 px-4 py-2 bg-aegis-dark border border-aegis-border text-white text-sm font-medium rounded-lg hover:border-aegis-muted transition-colors"
            >
              Browse exercises
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ExperiencedHeader() {
  return (
    <motion.div variants={sectionVariants}>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <Link
          to="/app/insights"
          className="text-xs text-aegis-gold hover:text-aegis-gold-light transition-colors flex items-center gap-1"
        >
          View insights
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
}

export const DashboardPage = () => {
  const experienceLevel = useAuthStore((s) => s.user?.experienceLevel);
  const isBeginner = experienceLevel === 'new' || experienceLevel === 'few_months';

  return (
    <motion.div
      className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isBeginner && <BeginnerWelcome />}
      {!isBeginner && <ExperiencedHeader />}

      <motion.div variants={sectionVariants}>
        <SectionErrorBoundary title="Summary Cards">
          <DashboardSummaryCards />
        </SectionErrorBoundary>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6"
      >
        <SectionErrorBoundary title="Weekly Performance">
          <WeeklyPerformanceChart />
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Strength Progress">
          <StrengthProgressWidget />
        </SectionErrorBoundary>
      </motion.div>

      <motion.div
        variants={sectionVariants}
        className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6"
      >
        <SectionErrorBoundary title="Consistency Grid">
          <ConsistencyGrid />
        </SectionErrorBoundary>
        <SectionErrorBoundary title="Goals Snapshot">
          <GoalsSnapshot />
        </SectionErrorBoundary>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;
