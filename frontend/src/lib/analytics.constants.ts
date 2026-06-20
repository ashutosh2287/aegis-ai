import { TrendingUp, Heart, Calendar, AlertTriangle } from 'lucide-react';

interface CategoryConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  'progressive overload': {
    label: 'Progressive Overload',
    icon: TrendingUp,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
  recovery: {
    label: 'Recovery',
    icon: Heart,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  consistency: {
    label: 'Consistency',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  'plateau-based': {
    label: 'Plateau Recovery',
    icon: AlertTriangle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
} as const;

export const PRIORITY_CONFIG = {
  high: { label: 'HIGH', color: 'text-red-700 bg-red-50' },
  medium: { label: 'MEDIUM', color: 'text-amber-700 bg-amber-50' },
  low: { label: 'LOW', color: 'text-gray-600 bg-gray-100' },
} as const;
