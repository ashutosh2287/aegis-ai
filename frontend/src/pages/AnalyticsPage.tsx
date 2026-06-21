import { motion } from 'framer-motion';
import { ComparativeAnalyticsSection } from '../components/dashboard/ComparativeAnalyticsSection';
import { PlateauDetectionSection } from '../components/dashboard/PlateauDetectionSection';
import { RecommendationsSection } from '../components/dashboard/RecommendationsSection';
import { PersonalRecordsSection } from '../components/dashboard/PersonalRecordsSection';
import { SectionErrorBoundary } from '../components/dashboard/SectionErrorBoundary';

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const sections = [
  { label: 'Comparative Analytics', Component: ComparativeAnalyticsSection },
  { label: 'Plateau Detection', Component: PlateauDetectionSection },
  { label: 'Recommendations', Component: RecommendationsSection },
  { label: 'Personal Records', Component: PersonalRecordsSection },
];

export const AnalyticsPage = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8"
    >
      {sections.map(({ label, Component }) => (
        <motion.section key={label} variants={sectionVariants}>
          <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 mb-2">
            {label}
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <SectionErrorBoundary title={label}>
              <Component />
            </SectionErrorBoundary>
          </div>
        </motion.section>
      ))}
    </motion.div>
  );
};

export default AnalyticsPage;
