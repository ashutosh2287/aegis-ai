import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, CheckCircle, Target, ArrowRight, Loader2, RotateCcw } from 'lucide-react';
import { useProgressAnalysis } from '../hooks/useAi';

const PERIODS = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

const FOCUS_OPTIONS = [
  { value: 'overall', label: 'Overall' },
  { value: 'strength', label: 'Strength' },
  { value: 'volume', label: 'Volume' },
  { value: 'consistency', label: 'Consistency' },
];

export default function ProgressAnalysisPage() {
  const { mutate, data, isPending, error } = useProgressAnalysis();
  const [period, setPeriod] = useState('month');
  const [focus, setFocus] = useState('overall');

  const handleAnalyze = () => {
    mutate({ period, focus });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Progress Analysis</h1>

      {/* Form */}
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-aegis-muted mb-2">Time Period</label>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`flex-1 py-2 rounded-lg border text-xs transition-colors ${
                    period === p.value
                      ? 'border-aegis-gold bg-aegis-gold/10 text-aegis-gold'
                      : 'border-aegis-border text-aegis-muted hover:bg-white/5'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-aegis-muted mb-2">Focus Area</label>
            <div className="flex gap-2">
              {FOCUS_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFocus(f.value)}
                  className={`flex-1 py-2 rounded-lg border text-xs transition-colors ${
                    focus === f.value
                      ? 'border-aegis-gold bg-aegis-gold/10 text-aegis-gold'
                      : 'border-aegis-border text-aegis-muted hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isPending}
          className="w-full bg-aegis-gold text-aegis-black py-3 rounded-lg font-semibold hover:bg-aegis-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
          ) : (
            <><TrendingUp className="w-4 h-4" /> Analyze Progress</>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {(error as Error).message || 'Failed to analyze progress'}
          </div>
        )}
      </div>

      {/* Results */}
      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Analysis Results</h2>
            <button onClick={handleAnalyze} className="flex items-center gap-1 text-xs text-aegis-muted hover:text-white transition-colors">
              <RotateCcw className="w-3 h-3" /> Re-analyze
            </button>
          </div>

          {/* Summary */}
          <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
            <h3 className="text-xs text-aegis-muted uppercase tracking-wider mb-2">Summary</h3>
            <p className="text-sm text-white leading-relaxed">{data.summary}</p>
          </div>

          {/* Analysis Sections */}
          <div className="grid gap-3">
            {[
              { label: 'Workout Consistency', value: data.workoutConsistency },
              { label: 'Volume Progression', value: data.volumeProgression },
              { label: 'Strength Progression', value: data.strengthProgression },
              { label: 'Goal Progress', value: data.goalProgress },
            ].filter((s) => s.value).map((section, i) => (
              <motion.div
                key={section.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4"
              >
                <h4 className="text-xs text-aegis-gold uppercase tracking-wider mb-2">{section.label}</h4>
                <p className="text-sm text-aegis-muted leading-relaxed">{section.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Issues */}
          {data.issues && data.issues.length > 0 && (
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
              <h3 className="text-xs text-aegis-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3 h-3 text-yellow-500" />
                Issues Detected
              </h3>
              <ul className="space-y-2">
                {data.issues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-aegis-muted">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
              <h3 className="text-xs text-aegis-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-green-500" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {data.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-aegis-muted">
                    <span className="text-green-500 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Actions */}
          {data.nextActions && data.nextActions.length > 0 && (
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5">
              <h3 className="text-xs text-aegis-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <Target className="w-3 h-3 text-aegis-gold" />
                Next Actions
              </h3>
              <ul className="space-y-2">
                {data.nextActions.map((action, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-aegis-muted">
                    <ArrowRight className="w-3 h-3 text-aegis-gold flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
