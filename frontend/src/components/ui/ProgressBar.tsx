import { useEffect, useRef, useState } from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(Math.min(100, Math.max(0, progress)));
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div
      ref={ref}
      className={`h-2 bg-aegis-border rounded-full overflow-hidden ${className}`}
    >
      <div
        className="h-full bg-aegis-gold rounded-full"
        style={{
          width: `${width}%`,
          transition: 'width 1s ease',
        }}
      />
    </div>
  );
}
