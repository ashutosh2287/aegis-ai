import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { GoalStatus } from '../../lib/goals.types';

const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; color: string }
> = {
  achieved: { label: 'Achieved', color: 'bg-green-900/30 text-green-400 border-green-800/50' },
  on_track: { label: 'On Track', color: 'bg-aegis-gold/10 text-aegis-gold border-aegis-gold/30' },
  at_risk: { label: 'At Risk', color: 'bg-amber-900/30 text-amber-400 border-amber-800/50' },
  behind: { label: 'Behind', color: 'bg-amber-900/30 text-amber-400 border-amber-800/50' },
  expired: { label: 'Expired', color: 'bg-aegis-dark text-aegis-muted border-aegis-border' },
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
