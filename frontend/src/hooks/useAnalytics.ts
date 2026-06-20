import { useQuery } from '@tanstack/react-query';
import { keepPreviousData } from '@tanstack/react-query';
import { analyticsService } from '../lib/analytics.service';
import type {
  ComparativeAnalytics,
  ComparativePeriod,
  PlateauDetection,
  Recommendation,
  PersonalRecord,
} from '../lib/analytics.types';

export const useComparativeAnalytics = (period: ComparativePeriod) => {
  return useQuery<ComparativeAnalytics, Error>({
    queryKey: ['analytics', 'comparative', period],
    queryFn: () => analyticsService.getComparative(period),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
};

export const usePlateauDetection = () => {
  return useQuery<PlateauDetection, Error>({
    queryKey: ['analytics', 'plateau-detection'],
    queryFn: () => analyticsService.getPlateauDetection(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useRecommendations = () => {
  return useQuery<Recommendation[], Error>({
    queryKey: ['analytics', 'recommendations'],
    queryFn: () => analyticsService.getRecommendations(),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePersonalRecords = () => {
  return useQuery<PersonalRecord[], Error>({
    queryKey: ['analytics', 'personal-records'],
    queryFn: () => analyticsService.getPersonalRecords(),
    staleTime: 5 * 60 * 1000,
  });
};
