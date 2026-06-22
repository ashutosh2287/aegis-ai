export interface ChatResponse {
  message: string;
  metadata?: Record<string, any>;
}

export interface WorkoutPlanResponse {
  summary: string;
  weeklySplit: WeeklySplit;
  notes: string[];
}

export interface WeeklySplit {
  days: DayPlan[];
}

export interface DayPlan {
  day: string;
  focus: string;
  exercises: ExercisePlan[];
}

export interface ExercisePlan {
  name: string;
  muscleGroups: string[];
  sets: number;
  reps: string;
  restSeconds: number;
  notes: string;
}

export interface NutritionPlanResponse {
  summary: string;
  dailyCalories: number;
  goalCalories: number;
  macros: MacroBreakdown;
  mealPlan: MealPlan;
}

export interface MacroBreakdown {
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface MealPlan {
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal;
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}

export interface AnalysisResponse {
  summary: string;
  workoutConsistency: string;
  volumeProgression: string;
  strengthProgression: string;
  goalProgress: string;
  issues: string[];
  recommendations: string[];
  nextActions: string[];
}
