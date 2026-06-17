export interface VolumeAnalytics {
  totalVolume: number;
  weeklyVolume: number;
  monthlyVolume: number;
  dailyBreakdown: Array<{
    date: string;
    volume: number;
  }>;
  weeklyBreakdown: Array<{
    weekStart: string;
    weekEnd: string;
    volume: number;
  }>;
  monthlyBreakdown: Array<{
    month: string;
    volume: number;
  }>;
}