import { motion } from 'framer-motion';
import { DashboardSummaryCards } from '../components/dashboard/DashboardSummaryCards';
import { WeeklyPerformanceChart } from '../components/dashboard/WeeklyPerformanceChart';
import { StrengthProgressWidget } from '../components/dashboard/StrengthProgressWidget';
import { ConsistencyGrid } from '../components/dashboard/ConsistencyGrid';
import { GoalsSnapshot } from '../components/dashboard/GoalsSnapshot';
import { SectionErrorBoundary } from '../components/dashboard/SectionErrorBoundary';

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
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export const DashboardPage = () => {
  return (
    <motion.div
      className="p-6 space-y-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
