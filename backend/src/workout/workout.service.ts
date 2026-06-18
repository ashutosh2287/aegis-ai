import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateWorkoutDto } from "./dto/create-workout.dto";
import { UpdateWorkoutDto } from "./dto/update-workout.dto";
import {
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "./interfaces/workout.interface";

@Injectable()
export class WorkoutService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a new workout for a user.
   * @param userId - The ID of the user
   * @param dto - The workout data
   * @returns Promise of the created workout with exercises and sets
   */
  async create(
    userId: string,
    dto: CreateWorkoutDto,
  ): Promise<
    Workout & { exercises: (WorkoutExercise & { sets: WorkoutSet[] })[] }
  > {
    // Validate that exercises array is provided and not empty? (optional, but we can allow empty)
    if (!dto.exercises || dto.exercises.length === 0) {
      // We'll allow empty exercises, but note: a workout without exercises might be useless.
      // We'll not throw an error, but we can if business logic requires.
      // For now, we'll allow it.
    }

    // 1. Create the workout record
    const workoutData: any = {
      user_id: userId,
      name: dto.name ?? null,
      description: dto.description ?? null,
    };

    const { data: workoutDataResult, error: workoutError } =
      await this.supabaseService
        .getClient()
        .from("workouts")
        .insert(workoutData)
        .select()
        .single();

    if (workoutError) {
      throw new InternalServerErrorException(
        `Failed to create workout: ${workoutError.message}`,
      );
    }

    if (!workoutDataResult) {
      throw new InternalServerErrorException(
        "Workout created but no data returned",
      );
    }

    const workoutId = workoutDataResult.id;

    // 2. For each exercise in dto.exercises, create a workout_exercise record
    const workoutExercises: (WorkoutExercise & { sets: WorkoutSet[] })[] = [];

    for (const exerciseDto of dto.exercises) {
      // Create workout_exercise
      const workoutExerciseData = {
        workout_id: workoutId,
        exercise_id: exerciseDto.exerciseId,
      };

      const { data: workoutExerciseDataResult, error: workoutExerciseError } =
        await this.supabaseService
          .getClient()
          .from("workout_exercises")
          .insert(workoutExerciseData)
          .select()
          .single();

      if (workoutExerciseError) {
        // If we fail to create workout_exercise, we should clean up the workout and any previously created workout_exercises and sets.
        await this.supabaseService
          .getClient()
          .from("workouts")
          .delete()
          .eq("id", workoutId);
        await this.supabaseService
          .getClient()
          .from("workout_exercises")
          .delete()
          .eq("workout_id", workoutId);
        throw new InternalServerErrorException(
          `Failed to create workout-exercise: ${workoutExerciseError.message}`,
        );
      }

      if (!workoutExerciseDataResult) {
        await this.supabaseService
          .getClient()
          .from("workouts")
          .delete()
          .eq("id", workoutId);
        await this.supabaseService
          .getClient()
          .from("workout_exercises")
          .delete()
          .eq("workout_id", workoutId);
        throw new InternalServerErrorException(
          "Workout-exercise created but no data returned",
        );
      }

      const workoutExerciseId = workoutExerciseDataResult.id;

      // 3. For each set in exerciseDto.sets, create a workout_set record
      const workoutSets: WorkoutSet[] = [];

      for (const setDto of exerciseDto.sets) {
        const workoutSetData = {
          workout_exercise_id: workoutExerciseId,
          set_number: setDto.setNumber,
          reps: setDto.reps,
          weight: setDto.weight ?? null,
          rpe: setDto.rpe ?? null,
          notes: setDto.notes ?? null,
        };

        const { data: workoutSetDataResult, error: workoutSetError } =
          await this.supabaseService
            .getClient()
            .from("workout_sets")
            .insert(workoutSetData)
            .select()
            .single();

        if (workoutSetError) {
          // Clean up: delete the workout, workout_exercises, and any workout_sets we created so far for this exercise.
          await this.supabaseService
            .getClient()
            .from("workouts")
            .delete()
            .eq("id", workoutId);
          await this.supabaseService
            .getClient()
            .from("workout_exercises")
            .delete()
            .eq("workout_id", workoutId);
          await this.supabaseService
            .getClient()
            .from("workout_sets")
            .delete()
            .eq("workout_exercise_id", workoutExerciseId);
          throw new InternalServerErrorException(
            `Failed to create workout-set: ${workoutSetError.message}`,
          );
        }

        if (!workoutSetDataResult) {
          await this.supabaseService
            .getClient()
            .from("workouts")
            .delete()
            .eq("id", workoutId);
          await this.supabaseService
            .getClient()
            .from("workout_exercises")
            .delete()
            .eq("workout_id", workoutId);
          await this.supabaseService
            .getClient()
            .from("workout_sets")
            .delete()
            .eq("workout_exercise_id", workoutExerciseId);
          throw new InternalServerErrorException(
            "Workout-set created but no data returned",
          );
        }

        workoutSets.push({
          id: workoutSetDataResult.id,
          workoutExerciseId: workoutExerciseDataResult.id,
          setNumber: workoutSetDataResult.set_number,
          reps: workoutSetDataResult.reps,
          weight: workoutSetDataResult.weight,
          rpe: workoutSetDataResult.rpe,
          notes: workoutSetDataResult.notes,
          createdAt: workoutSetDataResult.created_at,
        });
      }

      workoutExercises.push({
        id: workoutExerciseDataResult.id,
        workoutId: workoutExerciseDataResult.workout_id,
        exerciseId: workoutExerciseDataResult.exercise_id,
        createdAt: workoutExerciseDataResult.created_at,
        sets: workoutSets,
      });
    }

    // 4. Return the workout with exercises and sets
    return {
      id: workoutDataResult.id,
      userId: workoutDataResult.user_id,
      name: workoutDataResult.name,
      description: workoutDataResult.description,
      createdAt: workoutDataResult.created_at,
      updatedAt: workoutDataResult.updated_at,
      deletedAt: workoutDataResult.deleted_at,
      exercises: workoutExercises,
    } as unknown as Workout & {
      exercises: (WorkoutExercise & { sets: WorkoutSet[] })[];
    };
  }

  /**
   * Get all workouts for a user.
   * @param userId - The ID of the user
   * @returns Promise of array of workouts (with exercises and sets?)
   */
  async findAll(userId: string): Promise<Workout[]> {
    const { data: workoutsData, error: workoutsError } =
      await this.supabaseService
        .getClient()
        .from("workouts")
        .select("*")
        .eq("user_id", userId)
        .is("deleted_at", null);

    if (workoutsError) {
      throw new InternalServerErrorException(
        `Failed to fetch workouts: ${workoutsError.message}`,
      );
    }

    // Map to Workout interface (without exercises and sets for now? We can fetch them if needed, but the task doesn't specify.
    // We'll return just the workout header for findAll, as is common.
    return workoutsData.map((workout: any) => ({
      id: workout.id,
      userId: workout.user_id,
      name: workout.name,
      description: workout.description,
      createdAt: workout.created_at,
      updatedAt: workout.updated_at,
      deletedAt: workout.deleted_at,
    }));
  }

  /**
   * Get a single workout by ID for a user.
   * @param id - The workout ID
   * @param userId - The ID of the user
   * @returns Promise of the workout with exercises and sets
   */
  async findOne(
    id: string,
    userId: string,
  ): Promise<
    Workout & { exercises: (WorkoutExercise & { sets: WorkoutSet[] })[] }
  > {
    // First, get the workout
    const { data: workoutData, error: workoutError } =
      await this.supabaseService
        .getClient()
        .from("workouts")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single();

    if (workoutError) {
      if (workoutError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(`Workout with ID ${id} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout: ${workoutError.message}`,
      );
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${id} not found`);
    }

    // Now, get the exercises for this workout
    const { data: exercisesData, error: exercisesError } =
      await this.supabaseService
        .getClient()
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", id);

    if (exercisesError) {
      throw new InternalServerErrorException(
        `Failed to fetch workout exercises: ${exercisesError.message}`,
      );
    }

    // For each exercise, get the sets
    const workoutExercises: (WorkoutExercise & { sets: WorkoutSet[] })[] = [];

    for (const exercise of exercisesData) {
      const { data: setsData, error: setsError } = await this.supabaseService
        .getClient()
        .from("workout_sets")
        .select("*")
        .eq("workout_exercise_id", exercise.id);

      if (setsError) {
        throw new InternalServerErrorException(
          `Failed to fetch workout sets: ${setsError.message}`,
        );
      }

      const sets: WorkoutSet[] = setsData.map((set: any) => ({
        id: set.id,
        workoutExerciseId: set.workout_exercise_id,
        setNumber: set.set_number,
        reps: set.reps,
        weight: set.weight,
        rpe: set.rpe,
        notes: set.notes,
        createdAt: set.created_at,
      }));

      workoutExercises.push({
        id: exercise.id,
        workoutId: exercise.workout_id,
        exerciseId: exercise.exercise_id,
        createdAt: exercise.created_at,
        sets: sets,
      });
    }

    return {
      id: workoutData.id,
      userId: workoutData.user_id,
      name: workoutData.name,
      description: workoutData.description,
      createdAt: workoutData.created_at,
      updatedAt: workoutData.updated_at,
      deletedAt: workoutData.deleted_at,
      exercises: workoutExercises,
    } as unknown as Workout & {
      exercises: (WorkoutExercise & { sets: WorkoutSet[] })[];
    };
  }

  /**
   * Update a workout by ID for a user.
   * @param id - The workout ID
   * @param userId - The ID of the user
   * @param dto - The workout data to update
   * @returns Promise of the updated workout
   */
  async update(
    id: string,
    userId: string,
    dto: UpdateWorkoutDto,
  ): Promise<Workout> {
    // First, check if the workout exists and belongs to the user
    const existingWorkout = await this.findOne(id, userId);
    // Note: findOne will throw NotFoundException if not found or not belonging to user.

    // We'll update the workout fields (name, description) if provided
    const updateData: any = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description ?? null;
    }

    // If there are no workout fields to update, we still might need to update exercises and sets.
    // But note: the UpdateWorkoutDto extends PartialType(CreateWorkoutDto), so it includes exercises array.
    // We'll handle exercises and sets separately.

    // Update the workout record if there are changes to name or description
    if (Object.keys(updateData).length > 0) {
      const { data: updatedWorkoutData, error: updateError } =
        await this.supabaseService
          .getClient()
          .from("workouts")
          .update(updateData)
          .eq("id", id)
          .select()
          .single();

      if (updateError) {
        throw new InternalServerErrorException(
          `Failed to update workout: ${updateError.message}`,
        );
      }

      if (!updatedWorkoutData) {
        throw new InternalServerErrorException(
          "Workout updated but no data returned",
        );
      }
    }

    // Now, handle exercises and sets if provided in dto
    if (dto.exercises !== undefined) {
      // We'll replace the existing exercises and sets for this workout.
      // Step 1: Delete existing workout_sets for this workout's exercises
      // We need to get the workout_exercise ids for this workout first.
      const { data: existingExercises, error: exError } =
        await this.supabaseService
          .getClient()
          .from("workout_exercises")
          .select("id")
          .eq("workout_id", id);

      if (exError) {
        throw new InternalServerErrorException(
          `Failed to fetch existing workout exercises: ${exError.message}`,
        );
      }

      const exerciseIds = existingExercises.map((e: any) => e.id);

      // Delete all workout_sets for these exercise ids
      if (exerciseIds.length > 0) {
        const { error: setsDeleteError } = await this.supabaseService
          .getClient()
          .from("workout_sets")
          .delete()
          .in("workout_exercise_id", exerciseIds);

        if (setsDeleteError) {
          throw new InternalServerErrorException(
            `Failed to delete existing workout sets: ${setsDeleteError.message}`,
          );
        }
      }

      // Delete all workout_exercises for this workout
      const { error: exDeleteError } = await this.supabaseService
        .getClient()
        .from("workout_exercises")
        .delete()
        .eq("workout_id", id);

      if (exDeleteError) {
        throw new InternalServerErrorException(
          `Failed to delete existing workout exercises: ${exDeleteError.message}`,
        );
      }

      // Now, create new exercises and sets from dto.exercises
      for (const exerciseDto of dto.exercises) {
        // Create workout_exercise
        const workoutExerciseData = {
          workout_id: id,
          exercise_id: exerciseDto.exerciseId,
        };

        const { data: workoutExerciseDataResult, error: workoutExerciseError } =
          await this.supabaseService
            .getClient()
            .from("workout_exercises")
            .insert(workoutExerciseData)
            .select()
            .single();

        if (workoutExerciseError) {
          throw new InternalServerErrorException(
            `Failed to create workout-exercise: ${workoutExerciseError.message}`,
          );
        }

        if (!workoutExerciseDataResult) {
          throw new InternalServerErrorException(
            "Workout-exercise created but no data returned",
          );
        }

        const workoutExerciseId = workoutExerciseDataResult.id;

        // Create sets for this exercise
        for (const setDto of exerciseDto.sets) {
          const workoutSetData = {
            workout_exercise_id: workoutExerciseId,
            set_number: setDto.setNumber,
            reps: setDto.reps,
            weight: setDto.weight ?? null,
            rpe: setDto.rpe ?? null,
            notes: setDto.notes ?? null,
          };

          const { data: workoutSetDataResult, error: workoutSetError } =
            await this.supabaseService
              .getClient()
              .from("workout_sets")
              .insert(workoutSetData)
              .select()
              .single();

          if (workoutSetError) {
            throw new InternalServerErrorException(
              `Failed to create workout-set: ${workoutSetError.message}`,
            );
          }

          if (!workoutSetDataResult) {
            throw new InternalServerErrorException(
              "Workout-set created but no data returned",
            );
          }
        }
      }
    }

    // Return the updated workout (we'll refetch to get the latest state)
    return this.findOne(id, userId);
  }

  /**
   * Delete a workout by ID for a user (soft delete).
   * @param id - The workout ID
   * @param userId - The ID of the user
   */
  async remove(id: string, userId: string): Promise<void> {
    // First, check if the workout exists and belongs to the user
    const existingWorkout = await this.findOne(id, userId);
    // findOne will throw NotFoundException if not found.

    // Soft delete by setting deleted_at to current timestamp
    const { error: deleteError } = await this.supabaseService
      .getClient()
      .from("workouts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete workout: ${deleteError.message}`,
      );
    }
  }
}
