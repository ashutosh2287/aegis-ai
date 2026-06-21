import type { FrequencyWeek } from '../../lib/goals.types';

interface FrequencyMiniBarsProps {
  weeks: FrequencyWeek[];
}

export function FrequencyMiniBars({ weeks }: FrequencyMiniBarsProps) {
  const maxSessions = Math.max(...weeks.map((w) => w.sessions), 1);

  return (
    <div className="space-y-1.5">
      <div className="flex items-end gap-1 h-10">
        {weeks.map((week, i) => {
          const isCurrentWeek = i === weeks.length - 1;
          const met = week.sessions >= week.target;
          const heightPct = (week.sessions / maxSessions) * 100;

          return (
            <div key={week.weekLabel} className="flex-1 flex flex-col items-center gap-1">
              <div
                className={`w-full rounded-sm transition-colors ${
                  met ? 'bg-green-400' : 'bg-amber-400'
                } ${isCurrentWeek ? 'ring-1 ring-indigo-400' : ''}`}
                style={{ height: `${Math.max(heightPct, 8)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1">
        {weeks.map((week) => (
          <span key={week.weekLabel} className="flex-1 text-center text-[10px] text-gray-400 truncate">
            {week.weekLabel}
          </span>
        ))}
      </div>
    </div>
  );
}
