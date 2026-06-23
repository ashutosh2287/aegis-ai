import { useMutation } from '@tanstack/react-query';
import { aiService } from '../lib/ai.service';

export function useWorkoutGenerator() {
  return useMutation({
    mutationFn: (params?: {
      goal?: string;
      daysPerWeek?: number;
      focusAreas?: string[];
      notes?: string;
      durationMinutes?: number;
    }) => aiService.generateWorkout(params),
  });
}

export function useNutritionPlanner() {
  return useMutation({
    mutationFn: (params?: {
      dietaryPreference?: string;
      weight?: number;
      activityLevel?: string;
      restrictions?: string;
      mealsPerDay?: number;
    }) => aiService.generateNutrition(params),
  });
}

export function useProgressAnalysis() {
  return useMutation({
    mutationFn: (params?: { period?: string; focus?: string }) =>
      aiService.analyzeProgress(params),
  });
}
