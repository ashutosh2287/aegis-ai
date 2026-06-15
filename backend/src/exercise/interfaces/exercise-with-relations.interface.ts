import { Exercise } from './exercise.interface';

export interface ExerciseWithRelations extends Exercise {
  muscleGroups: string[];
  equipmentNeeded: string[];
}