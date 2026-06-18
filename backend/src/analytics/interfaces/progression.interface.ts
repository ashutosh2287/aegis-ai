export interface StrengthProgression {
  exerciseId: string;
  progression: Array<{
    date: string;
    weight: number | null;
    reps: number;
    setNumber: number;
    volume: number;
  }>;
  personalRecord: {
    weight: number | null;
    reps: number;
    date: string;
  } | null;
}
