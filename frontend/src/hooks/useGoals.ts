import { useQuery } from '@tanstack/react-query';
import { goalsService } from '../lib/goals.service';
import type {
  GoalProjection,
  ForecastHistoryPoint,
  ForecastRecommendation,
} from '../lib/goals.types';

export const useGoals = () => {
  return useQuery<GoalProjection[], Error>({
    queryKey: ['analytics', 'goals'],
    queryFn: () => goalsService.getGoals(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useGoalProjection = (goalId: string) => {
  return useQuery<GoalProjection, Error>({
    queryKey: ['analytics', 'goal-projection', goalId],
    queryFn: () => goalsService.getGoalProjection(goalId),
    staleTime: 5 * 60 * 1000,
    enabled: !!goalId,
  });
};

export const useStrengthForecast = () => {
  return useQuery<ForecastHistoryPoint[], Error>({
    queryKey: ['analytics', 'strength-forecast'],
    queryFn: () => goalsService.getStrengthForecast(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useVolumeForecast = () => {
  return useQuery<ForecastHistoryPoint[], Error>({
    queryKey: ['analytics', 'volume-forecast'],
    queryFn: () => goalsService.getVolumeForecast(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useFrequencyForecast = () => {
  return useQuery<ForecastHistoryPoint[], Error>({
    queryKey: ['analytics', 'frequency-forecast'],
    queryFn: () => goalsService.getFrequencyForecast(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useForecastRecommendations = () => {
  return useQuery<ForecastRecommendation[], Error>({
    queryKey: ['analytics', 'forecast-recommendations'],
    queryFn: () => goalsService.getForecastRecommendations(),
    staleTime: 5 * 60 * 1000,
  });
};
