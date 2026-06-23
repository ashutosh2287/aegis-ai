import { useState } from 'react';
import { motion } from 'framer-motion';
import { Apple, Utensils, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { useNutritionPlanner } from '../hooks/useAi';
import type { Meal } from '../lib/ai.types';

const DIETARY_OPTIONS = [
  { value: 'non_vegetarian', label: 'Non-Vegetarian' },
  { value: 'vegetarian', label: 'Vegetarian' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
  { value: 'very_active', label: 'Very Active' },
];

function MacroBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-aegis-muted">{label}</span>
        <span className="text-white">{value}g</span>
      </div>
      <div className="h-1.5 bg-aegis-dark rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

function MealCard({ label, meal }: { label: string; meal: Meal }) {
  if (!meal || !meal.name) return null;
  return (
    <div className="bg-aegis-dark rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Utensils className="w-3 h-3 text-aegis-gold" />
        <span className="text-xs text-aegis-muted uppercase tracking-wider">{label}</span>
      </div>
      <h4 className="text-white text-sm font-medium">{meal.name}</h4>
      <p className="text-aegis-muted text-xs">{meal.description}</p>
      <div className="flex gap-3 text-xs">
        <span className="text-aegis-gold">{meal.calories} cal</span>
        <span className="text-aegis-muted">P: {meal.protein}g</span>
        <span className="text-aegis-muted">C: {meal.carbohydrates}g</span>
        <span className="text-aegis-muted">F: {meal.fat}g</span>
      </div>
    </div>
  );
}

export default function NutritionPlannerPage() {
  const { mutate, data, isPending, error } = useNutritionPlanner();
  const [diet, setDiet] = useState('non_vegetarian');
  const [activity, setActivity] = useState('moderate');
  const [weight, setWeight] = useState('');
  const [restrictions, setRestrictions] = useState('');

  const handleGenerate = () => {
    mutate({
      dietaryPreference: diet,
      activityLevel: activity,
      weight: weight ? parseFloat(weight) : undefined,
      restrictions: restrictions || undefined,
    });
  };

  const totalMacros = data
    ? data.macros.protein + data.macros.carbohydrates + data.macros.fat
    : 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Nutrition Planner</h1>

      {/* Form */}
      <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5 space-y-5">
        {/* Dietary Preference */}
        <div>
          <label className="block text-xs text-aegis-muted mb-2">Dietary Preference</label>
          <div className="flex gap-2">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDiet(opt.value)}
                className={`flex-1 py-2.5 rounded-lg border text-sm transition-colors ${
                  diet === opt.value
                    ? 'border-aegis-gold bg-aegis-gold/10 text-aegis-gold'
                    : 'border-aegis-border text-aegis-muted hover:bg-white/5'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Level */}
        <div>
          <label className="block text-xs text-aegis-muted mb-2">Activity Level</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {ACTIVITY_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setActivity(lvl.value)}
                className={`py-2 rounded-lg border text-xs transition-colors ${
                  activity === lvl.value
                    ? 'border-aegis-gold bg-aegis-gold/10 text-aegis-gold'
                    : 'border-aegis-border text-aegis-muted hover:bg-white/5'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="block text-xs text-aegis-muted mb-2">Weight (kg, optional)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 75"
            min={30}
            max={250}
            className="w-full sm:w-48 bg-aegis-dark border border-aegis-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-aegis-muted focus:outline-none focus:ring-2 focus:ring-aegis-gold"
          />
        </div>

        {/* Restrictions */}
        <div>
          <label className="block text-xs text-aegis-muted mb-2">Dietary Restrictions (optional)</label>
          <input
            type="text"
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            placeholder="e.g. lactose intolerant, gluten free"
            className="w-full bg-aegis-dark border border-aegis-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-aegis-muted focus:outline-none focus:ring-2 focus:ring-aegis-gold"
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
            <><Apple className="w-4 h-4" /> Generate Nutrition Plan</>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {(error as Error).message || 'Failed to generate plan'}
          </div>
        )}
      </div>

      {/* Result */}
      {data && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-medium uppercase tracking-wider text-aegis-muted">Your Plan</h2>
            <button onClick={handleGenerate} className="flex items-center gap-1 text-xs text-aegis-muted hover:text-white transition-colors">
              <RotateCcw className="w-3 h-3" /> Regenerate
            </button>
          </div>

          {data.summary && (
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 text-sm text-aegis-muted">
              {data.summary}
            </div>
          )}

          {/* Calorie Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 text-center">
              <p className="text-[10px] text-aegis-muted uppercase tracking-wider mb-1">Daily Calories</p>
              <p className="text-2xl font-bold text-aegis-gold">{data.dailyCalories}</p>
            </div>
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 text-center">
              <p className="text-[10px] text-aegis-muted uppercase tracking-wider mb-1">Goal Calories</p>
              <p className="text-2xl font-bold text-white">{data.goalCalories}</p>
            </div>
            <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-4 text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] text-aegis-muted uppercase tracking-wider mb-1">Protein</p>
              <p className="text-2xl font-bold text-white">{data.macros.protein}g</p>
            </div>
          </div>

          {/* Macro Breakdown */}
          <div className="bg-aegis-charcoal rounded-xl border border-aegis-border p-5 space-y-3">
            <h3 className="text-xs text-aegis-muted uppercase tracking-wider">Macro Breakdown</h3>
            <MacroBar label="Protein" value={data.macros.protein} total={totalMacros} color="bg-blue-500" />
            <MacroBar label="Carbohydrates" value={data.macros.carbohydrates} total={totalMacros} color="bg-green-500" />
            <MacroBar label="Fat" value={data.macros.fat} total={totalMacros} color="bg-yellow-500" />
          </div>

          {/* Meal Plan */}
          <div>
            <h3 className="text-xs text-aegis-muted uppercase tracking-wider mb-3">Meal Plan</h3>
            <div className="grid gap-3">
              {data.mealPlan?.breakfast && <MealCard label="Breakfast" meal={data.mealPlan.breakfast} />}
              {data.mealPlan?.lunch && <MealCard label="Lunch" meal={data.mealPlan.lunch} />}
              {data.mealPlan?.dinner && <MealCard label="Dinner" meal={data.mealPlan.dinner} />}
              {data.mealPlan?.snacks && <MealCard label="Snacks" meal={data.mealPlan.snacks} />}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
