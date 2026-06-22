import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ExerciseLibraryItem } from '../interfaces/user-context.interface';

@Injectable()
export class ExerciseTool {
  private readonly logger = new Logger(ExerciseTool.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async getExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
    try {
      const { data: exercises, error } = await this.supabaseService
        .getClient()
        .from('exercises')
        .select('id, name, description, movement_pattern, difficulty')
        .eq('is_active', true)
        .limit(200);

      if (error || !exercises) {
        this.logger.error(`Failed to fetch exercises: ${error?.message}`);
        return [];
      }

      const exercisesWithRelations: ExerciseLibraryItem[] = [];

      for (const exercise of exercises) {
        const [musclesData, equipmentData] = await Promise.all([
          this.supabaseService
            .getClient()
            .from('exercise_muscles')
            .select('muscles(name)')
            .eq('exercise_id', exercise.id),
          this.supabaseService
            .getClient()
            .from('exercise_equipment')
            .select('equipment(name)')
            .eq('exercise_id', exercise.id),
        ]);

        exercisesWithRelations.push({
          id: exercise.id,
          name: exercise.name,
          description: exercise.description,
          muscleGroups: musclesData.data?.map((m: any) => m.muscles?.name).filter(Boolean) || [],
          equipmentNeeded: equipmentData.data?.map((e: any) => e.equipment?.name).filter(Boolean) || [],
          movementPattern: exercise.movement_pattern || 'other',
          difficulty: exercise.difficulty || 'intermediate',
        });
      }

      return exercisesWithRelations;
    } catch (error) {
      this.logger.error(`Error in getExerciseLibrary: ${(error as Error).message}`);
      return [];
    }
  }

  async getExercisesByEquipment(equipment: string[]): Promise<ExerciseLibraryItem[]> {
    const allExercises = await this.getExerciseLibrary();

    if (equipment.length === 0) return allExercises;

    return allExercises.filter((ex) =>
      ex.equipmentNeeded.length === 0 ||
      equipment.some((eq) => ex.equipmentNeeded.includes(eq))
    );
  }

  async getExercisesByMuscleGroup(muscleGroup: string): Promise<ExerciseLibraryItem[]> {
    const allExercises = await this.getExerciseLibrary();
    return allExercises.filter((ex) =>
      ex.muscleGroups.some((mg) => mg.toLowerCase() === muscleGroup.toLowerCase())
    );
  }
}
