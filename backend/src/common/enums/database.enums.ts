export enum MovementPattern {
  Squat = 'squat',
  Hinge = 'hinge',
  Lunge = 'lunge',
  Push = 'push',
  Pull = 'pull',
  Rotation = 'rotation',
  AntiRotation = 'anti_rotation',
  Carry = 'carry',
  Walk = 'walk',
  Jump = 'jump',
  Throw = 'throw',
  Core = 'core',
}

export enum DifficultyLevel {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Advanced = 'advanced',
}

export enum SessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum ExperienceLevel {
  NEW = 'new',
  FEW_MONTHS = 'few_months',
  ONE_YEAR = 'one_year',
  YEARS = 'years',
  COMPETITOR = 'competitor',
}

export enum WeightUnit {
  METRIC = 'metric',
  IMPERIAL = 'imperial',
}