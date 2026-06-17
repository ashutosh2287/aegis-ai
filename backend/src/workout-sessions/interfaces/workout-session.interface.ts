export interface WorkoutSession {
  id: string;
  userId: string;
  workoutId: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface WorkoutSessionResponse {
  id: string;
  userId: string;
  workoutId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}