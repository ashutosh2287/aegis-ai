import { motion } from 'framer-motion';
import { ComparativeAnalyticsSection } from '../components/dashboard/ComparativeAnalyticsSection';
import { PlateauDetectionSection } from '../components/dashboard/PlateauDetectionSection';
import { RecommendationsSection } from '../components/dashboard/RecommendationsSection';
import { PersonalRecordsSection } from '../components/dashboard/PersonalRecordsSection';
import { SectionErrorBoundary } from '../components/dashboard/SectionErrorBoundary';

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
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
  { title: 'Comparative Analytics', Component: ComparativeAnalyticsSection },
  { title: 'Plateau Detection', Component: PlateauDetectionSection },
  { title: 'Recommendations', Component: RecommendationsSection },
  { title: 'Personal Records', Component: PersonalRecordsSection },
];

export const AnalyticsPage = () => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8"
    >
      {sections.map(({ title, Component }) => (
        <motion.section key={title} variants={sectionVariants}>
          <SectionErrorBoundary title={title}>
            <Component />
          </SectionErrorBoundary>
        </motion.section>
      ))}
    </motion.div>
  );
};

export default AnalyticsPage;
