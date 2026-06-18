import { WorkoutConsistency } from '../interfaces/workout-consistency.interface';
import { StrengthTrendResponse } from '../interfaces/strength-progression.interface';
import { PersonalRecord } from '../interfaces/personal-record.interface';

export class DashboardResponseDto {
  constructor(
    public workoutConsistency: WorkoutConsistency,
    public weeklyVolume: { totalVolume: number; totalSets: number; totalReps: number },
    public monthlyVolume: { totalVolume: number; totalSets: number; totalReps: number },
    public personalRecords: PersonalRecord[],
  ) {}
}