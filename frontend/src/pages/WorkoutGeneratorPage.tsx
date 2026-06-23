import { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Target, Zap, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useWorkoutGenerator } from '../hooks/useAi';

const GOALS = [
  { value: 'muscle_gain', label: 'Muscle Gain', icon: Dumbbell },
  { value: 'fat_loss', label: 'Fat Loss', icon: Zap },
  { value: 'strength', label: 'Strength', icon: Target },
  { value: 'endurance', label: 'Endurance', icon: Clock },
  { value: 'general_fitness', label: 'General Fitness', icon: Dumbbell },
];

const FOCUS_AREAS = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'quads', 'hamstrings', 'glutes', 'calves', 'core'];

export default function WorkoutGeneratorPage() {
  const { mutate, data, isPending, error } = useWorkoutGenerator();
  const [goal, setGoal] = useState('muscle_gain');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const toggleFocus = (area: string) => {
    setSelectedFocus((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleGenerate = () => {
    mutate({
      goal,
      daysPerWeek,
      focusAreas: selectedFocus.length > 0 ? selectedFocus : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Workout Generator</h1>

      {/* Form */}
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5 space-y-5">
        {/* Goal */}
        <div>
          <label className="block text-xs text-aegis-muted mb-2">Training Goal</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {GOALS.map((g) => {
              const Icon = g.icon;
              return (
                <button
                  key={g.value}
                  onClick={() => setGoal(g.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-colors ${
                    goal === g.value
                      ? 'border-aegis-gold bg-aegis-gold/10 text-aegis-gold'
                      : 'border-aegis-border text-aegis-muted hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{g.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Days per week */}
        <div>
          <label className="block text-xs text-aegis-muted mb-2">Days Per Week</label>
          <div className="flex gap-2">
            {[2, 3, 4, 5, 6, 7].map((d) => (
              <button
                key={d}
                onClick={() => setDaysPerWeek(d)}
                className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                  daysPerWeek === d
                    ? 'border-aegis-gold bg-aegis-gold/10 text-aegis-gold'
                    : 'border-aegis-border text-aegis-muted hover:bg-white/5'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div>
          <label className="block text-xs text-aegis-muted mb-2">Focus Areas (optional)</label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => (
              <button
                key={area}
                onClick={() => toggleFocus(area)}
                className={`px-3 py-1.5 rounded-lg border text-xs capitalize transition-colors ${
                  selectedFocus.includes(area)
                    ? 'border-aegis-gold bg-aegis-gold/10 text-aegis-gold'
                    : 'border-aegis-border text-aegis-muted hover:bg-white/5'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs text-aegis-muted mb-2">Additional Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Focus on progressive overload, avoid overhead movements..."
            rows={2}
            className="w-full bg-aegis-dark border border-aegis-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-aegis-muted focus:outline-none focus:ring-2 focus:ring-aegis-gold resize-none"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="w-full bg-aegis-gold text-aegis-black py-3 rounded-lg font-semibold hover:bg-aegis-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Dumbbell className="w-4 h-4" /> Generate Workout</>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {(error as Error).message || 'Failed to generate workout'}
          </div>
        )}
      </div>

      {/* Result */}
      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Generated Plan</h2>
            <button onClick={handleGenerate} className="flex items-center gap-1 text-xs text-aegis-muted hover:text-white transition-colors">
              <RotateCcw className="w-3 h-3" /> Regenerate
            </button>
          </div>

          {data.summary && (
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 text-sm text-aegis-muted">
              {data.summary}
            </div>
          )}

          <div className="grid gap-4">
            {data.weeklySplit?.days?.map((day, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-aegis-gold font-semibold">{day.day}</span>
                  <span className="text-aegis-muted text-xs">—</span>
                  <span className="text-aegis-muted text-xs">{day.focus}</span>
                </div>
                <div className="space-y-2">
                  {day.exercises?.map((ex, j) => (
                    <div key={j} className="flex items-center justify-between py-2 border-b border-aegis-border/50 last:border-0">
                      <div>
                        <span className="text-white text-sm font-medium">{ex.name}</span>
                        <span className="text-aegis-muted text-xs ml-2">{ex.muscleGroups?.join(', ')}</span>
                      </div>
                      <div className="text-right text-xs text-aegis-muted">
                        <span className="text-white">{ex.sets} sets</span> × <span className="text-white">{ex.reps}</span>
                        <span className="ml-2">{ex.restSeconds}s rest</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {data.notes && data.notes.length > 0 && (
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4">
              <h3 className="text-xs text-aegis-muted mb-2 uppercase tracking-wider">Notes</h3>
              <ul className="space-y-1">
                {data.notes.map((note, i) => (
                  <li key={i} className="text-sm text-aegis-muted">• {note}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
