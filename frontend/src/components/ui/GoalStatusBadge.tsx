import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { GoalStatus } from '../../lib/goals.types';

const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; color: string }
> = {
  achieved: { label: 'Achieved', color: 'bg-green-50 text-green-700 border-green-200' },
  on_track: { label: 'On Track', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  at_risk: { label: 'At Risk', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  behind: { label: 'Behind', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  expired: { label: 'Expired', color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

interface GoalStatusBadgeProps {
  status: GoalStatus;
}

export function GoalStatusBadge({ status }: GoalStatusBadgeProps) {
  const [animate, setAnimate] = useState(false);
  const prevStatusRef = useRef(status);
  const config = STATUS_CONFIG[status];

  useEffect(() => {
    if (status !== prevStatusRef.current) {
      prevStatusRef.current = status;
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 400);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <motion.span
      animate={animate ? { scale: [1, 1.15, 1] } : { scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </motion.span>
  );
}
