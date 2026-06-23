export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  metadata?: {
    provider: string;
    model: string;
    iterations: number;
    toolCalls: number;
    totalLatencyMs: number;
  };
}

export interface WorkoutPlanResponse {
  summary: string;
  weeklySplit: {
    days: {
      day: string;
      focus: string;
      exercises: {
        name: string;
        muscleGroups: string[];
        sets: number;
        reps: string;
        restSeconds: number;
        notes: string;
      }[];
    }[];
  };
  notes: string[];
}

export interface NutritionPlanResponse {
  summary: string;
  dailyCalories: number;
  goalCalories: number;
  macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  mealPlan: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal;
  };
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

export interface HealthResponse {
  status: string;
  provider: string;
  model: string;
  error?: string;
}
