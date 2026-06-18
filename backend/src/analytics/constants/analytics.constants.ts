export const DEFAULT_TIMEFRAME = "month";
export const ANALYTICS_CACHE_TTL = 300; // 5 minutes in seconds
export const SUPPORTED_TIMEFRAMES = [
  "day",
  "week",
  "month",
  "year",
  "all",
] as const;
export type SupportedTimeframe = (typeof SUPPORTED_TIMEFRAMES)[number];
