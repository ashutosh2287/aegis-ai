import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { ExerciseLibraryItem } from '../interfaces/user-context.interface';

const CACHE_TTL_MS = parseInt(process.env.EXERCISE_CACHE_TTL_MS || '300000', 10);

@Injectable()
export class ExerciseTool implements OnModuleInit {
  private readonly logger = new Logger(ExerciseTool.name);
  private exerciseCache: ExerciseLibraryItem[] | null = null;
  private cacheTimestamp = 0;

  constructor(private readonly supabaseService: SupabaseService) {}

  async onModuleInit() {
    try {
      await this.getExerciseLibrary();
      this.logger.log(`Exercise library cached: ${this.exerciseCache?.length || 0} exercises`);
    } catch (error) {
      this.logger.warn(`Startup cache preload failed: ${(error as Error).message}`);
    }
  }

  async getExerciseLibrary(): Promise<ExerciseLibraryItem[]> {
    const now = Date.now();
    if (this.exerciseCache && (now - this.cacheTimestamp) < CACHE_TTL_MS) {
      return this.exerciseCache;
    }

    try {
      const client = this.supabaseService.getClient();

      const { data: exercises, error } = await client
        .from('exercises')
        .select('id, name, description, movement_pattern, difficulty')
        .eq('is_active', true)
        .limit(200);

      if (error || !exercises || exercises.length === 0) {
        this.logger.error(`Failed to fetch exercises: ${error?.message}`);
        return this.exerciseCache || [];
      }

      const exerciseIds = exercises.map((e: any) => e.id);

      const [musclesResult, equipmentResult] = await Promise.all([
        client
          .from('exercise_muscles')
          .select('exercise_id, muscles(name)')
          .in('exercise_id', exerciseIds),
        client
          .from('exercise_equipment')
          .select('exercise_id, equipment(name)')
          .in('exercise_id', exerciseIds),
      ]);

      const musclesByExercise = new Map<string, string[]>();
      for (const row of musclesResult.data || []) {
        const exId = (row as any).exercise_id;
        const name = (row as any).muscles?.name;
        if (name) {
          const existing = musclesByExercise.get(exId) || [];
          existing.push(name);
          musclesByExercise.set(exId, existing);
        }
      }

      const equipmentByExercise = new Map<string, string[]>();
      for (const row of equipmentResult.data || []) {
        const exId = (row as any).exercise_id;
        const name = (row as any).equipment?.name;
        if (name) {
          const existing = equipmentByExercise.get(exId) || [];
          existing.push(name);
          equipmentByExercise.set(exId, existing);
        }
      }

      const result: ExerciseLibraryItem[] = exercises.map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        muscleGroups: musclesByExercise.get(ex.id) || [],
        equipmentNeeded: equipmentByExercise.get(ex.id) || [],
        movementPattern: ex.movement_pattern || 'other',
        difficulty: ex.difficulty || 'intermediate',
      }));

      this.exerciseCache = result;
      this.cacheTimestamp = now;

      return result;
    } catch (error) {
      this.logger.error(`Error in getExerciseLibrary: ${(error as Error).message}`);
      return this.exerciseCache || [];
    }
  }

  async refreshCache(): Promise<void> {
    this.cacheTimestamp = 0;
    await this.getExerciseLibrary();
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
