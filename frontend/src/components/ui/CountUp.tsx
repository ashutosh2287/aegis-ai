import { useEffect } from 'react';
import { useMotionValue, animate, useTransform, motion } from 'framer-motion';

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  className?: string;
}

export const CountUp = ({
  from = 0,
  to,
  duration = 0.9,
  decimals = 0,
  className,
}: CountUpProps) => {
  const motionValue = useMotionValue(from);
  const rounded = useTransform(motionValue, (v) => v.toFixed(decimals));
  const displayValue = useTransform(rounded, (v) => Number(v).toLocaleString());

  useEffect(() => {
    const controls = animate(motionValue, to, {
      duration,
      ease: [0.16, 1, 0.3, 1] as const,
    });
    return controls.stop;
  }, [from, to, duration, motionValue]);

  return <motion.span className={className}>{displayValue}</motion.span>;
};
