import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { AddExerciseToWorkoutDto } from "./dto/add-exercise-to-workout.dto";
import { UpdateWorkoutExerciseDto } from "./dto/update-workout-exercise.dto";
import {
  ReorderWorkoutExercisesDto,
  ReorderItemDto,
} from "./dto/reorder-workout-exercises.dto";
import {
  WorkoutExercise,
  WorkoutExerciseWithExercise,
} from "./interfaces/workout-exercise.interface";
import { ExerciseService } from "../exercise/services/exercise.service";

@Injectable()
export class WorkoutExercisesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly exerciseService: ExerciseService,
  ) {}

  /**
   * Add an exercise to a workout.
   * @param workoutId - The ID of the workout
   * @param userId - The ID of the user (for ownership validation)
   * @param dto - The data for adding the exercise
   * @returns Promise of the created workout exercise with exercise details
   */
  async addExerciseToWorkout(
    workoutId: string,
    userId: string,
    dto: AddExerciseToWorkoutDto,
  ): Promise<WorkoutExerciseWithExercise> {
    // Validate that the workout exists and belongs to the user
    const { data: workoutData, error: workoutError } =
      await this.supabaseService
        .getClient()
        .from("workouts")
        .select("id")
        .eq("id", workoutId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single();

    if (workoutError) {
      if (workoutError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout: ${workoutError.message}`,
      );
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found`);
    }

    // Validate that the exercise exists
    const exercise = await this.exerciseService.getExerciseById(dto.exerciseId);
    if (!exercise) {
      throw new NotFoundException(
        `Exercise with ID ${dto.exerciseId} not found`,
      );
    }

    // Get the current maximum order_index for this workout to set the new exercise at the end
    const { data: orderData, error: orderError } = await this.supabaseService
      .getClient()
      .from("workout_exercises")
      .select("order_index")
      .eq("workout_id", workoutId)
      .is("deleted_at", null)
      .order("order_index", { ascending: false })
      .limit(1);

    let orderIndex = 0;
    if (!orderError && orderData && orderData.length > 0) {
      orderIndex = orderData[0].order_index + 1;
    }

    // Create the workout_exercise record
    const workoutExerciseData = {
      workout_id: workoutId,
      exercise_id: dto.exerciseId,
      order_index: orderIndex,
      notes: dto.notes ?? null,
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
        `Failed to add exercise to workout: ${workoutExerciseError.message}`,
      );
    }

    if (!workoutExerciseDataResult) {
      throw new InternalServerErrorException(
        "Workout exercise created but no data returned",
      );
    }

    // Return the workout exercise with exercise details
    return {
      id: workoutExerciseDataResult.id,
      workoutId: workoutExerciseDataResult.workout_id,
      exerciseId: workoutExerciseDataResult.exercise_id,
      orderIndex: workoutExerciseDataResult.order_index,
      notes: workoutExerciseDataResult.notes,
      createdAt: workoutExerciseDataResult.created_at,
      updatedAt: workoutExerciseDataResult.updated_at,
      deletedAt: workoutExerciseDataResult.deleted_at,
      exercise: {
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        movementPattern: exercise.movementPattern,
        difficulty: exercise.difficulty,
        videoUrl: exercise.videoUrl,
        instructions: exercise.instructions,
        isCustom: exercise.isCustom,
        createdBy: exercise.createdBy,
        parentVariationId: exercise.parentVariationId,
        tags: exercise.tags,
        isActive: exercise.isActive,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
        // Note: ExerciseWithRelations has muscleGroups and equipmentNeeded, but our Exercise interface doesn't.
        // We are only mapping to the Exercise interface, so we omit the extra fields.
      },
    };
  }

  /**
   * Get all exercises for a workout, ordered by order_index.
   * @param workoutId - The ID of the workout
   * @param userId - The ID of the user (for ownership validation)
   * @returns Promise of array of workout exercises with exercise details
   */
  async getWorkoutExercises(
    workoutId: string,
    userId: string,
  ): Promise<WorkoutExerciseWithExercise[]> {
    // Validate that the workout exists and belongs to the user
    const { data: workoutData, error: workoutError } =
      await this.supabaseService
        .getClient()
        .from("workouts")
        .select("id")
        .eq("id", workoutId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single();

    if (workoutError) {
      if (workoutError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout: ${workoutError.message}`,
      );
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found`);
    }

    // Get the workout exercises for this workout, ordered by order_index
    const { data: exercisesData, error: exercisesError } =
      await this.supabaseService
        .getClient()
        .from("workout_exercises")
        .select("*")
        .eq("workout_id", workoutId)
        .is("deleted_at", null)
        .order("order_index", { ascending: true });

    if (exercisesError) {
      throw new InternalServerErrorException(
        `Failed to fetch workout exercises: ${exercisesError.message}`,
      );
    }

    // For each exercise, fetch the exercise details and map to WorkoutExerciseWithExercise
    const workoutExercises: WorkoutExerciseWithExercise[] = [];

    for (const exercise of exercisesData) {
      const exerciseDetails = await this.exerciseService.getExerciseById(
        exercise.exercise_id,
      );
      if (!exerciseDetails) {
        // If the exercise is not found, we can skip it or throw an error.
        // Since we have a foreign key constraint, it should exist, but we'll skip for safety.
        continue;
      }

      workoutExercises.push({
        id: exercise.id,
        workoutId: exercise.workout_id,
        exerciseId: exercise.exercise_id,
        orderIndex: exercise.order_index,
        notes: exercise.notes,
        createdAt: exercise.created_at,
        updatedAt: exercise.updated_at,
        deletedAt: exercise.deleted_at,
        exercise: {
          id: exerciseDetails.id,
          name: exerciseDetails.name,
          description: exerciseDetails.description,
          movementPattern: exerciseDetails.movementPattern,
          difficulty: exerciseDetails.difficulty,
          videoUrl: exerciseDetails.videoUrl,
          instructions: exerciseDetails.instructions,
          isCustom: exerciseDetails.isCustom,
          createdBy: exerciseDetails.createdBy,
          parentVariationId: exerciseDetails.parentVariationId,
          tags: exerciseDetails.tags,
          isActive: exerciseDetails.isActive,
          createdAt: exerciseDetails.createdAt,
          updatedAt: exerciseDetails.updatedAt,
          // Note: ExerciseWithRelations has muscleGroups and equipmentNeeded, but our Exercise interface doesn't.
          // We are only mapping to the Exercise interface, so we omit the extra fields.
        },
      });
    }

    return workoutExercises;
  }

  /**
   * Update a workout exercise (notes only).
   * @param workoutId - The ID of the workout (for ownership validation)
   * @param userId - The ID of the user (for ownership validation)
   * @param workoutExerciseId - The ID of the workout exercise to update
   * @param dto - The data for updating the workout exercise
   * @returns Promise of the updated workout exercise
   */
  async updateWorkoutExercise(
    workoutId: string,
    userId: string,
    workoutExerciseId: string,
    dto: UpdateWorkoutExerciseDto,
  ): Promise<WorkoutExercise> {
    // Validate that the workout exists and belongs to the user
    const { data: workoutData, error: workoutError } =
      await this.supabaseService
        .getClient()
        .from("workouts")
        .select("id")
        .eq("id", workoutId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single();

    if (workoutError) {
      if (workoutError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout: ${workoutError.message}`,
      );
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found`);
    }

    // Validate that the workout exercise exists and belongs to the workout
    const { data: workoutExerciseData, error: workoutExerciseError } =
      await this.supabaseService
        .getClient()
        .from("workout_exercises")
        .select("*")
        .eq("id", workoutExerciseId)
        .eq("workout_id", workoutId)
        .is("deleted_at", null)
        .single();

    if (workoutExerciseError) {
      if (workoutExerciseError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(
          `Workout exercise with ID ${workoutExerciseId} not found`,
        );
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout exercise: ${workoutExerciseError.message}`,
      );
    }

    if (!workoutExerciseData) {
      throw new NotFoundException(
        `Workout exercise with ID ${workoutExerciseId} not found`,
      );
    }

    // Update the workout exercise
    const updateData: any = {};
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes ?? null;
    }

    // If there are no fields to update, return the existing workout exercise
    if (Object.keys(updateData).length === 0) {
      return {
        id: workoutExerciseData.id,
        workoutId: workoutExerciseData.workout_id,
        exerciseId: workoutExerciseData.exercise_id,
        orderIndex: workoutExerciseData.order_index,
        notes: workoutExerciseData.notes,
        createdAt: workoutExerciseData.created_at,
        updatedAt: workoutExerciseData.updated_at,
        deletedAt: workoutExerciseData.deleted_at,
      };
    }

    const { data: updatedWorkoutExerciseData, error: updateError } =
      await this.supabaseService
        .getClient()
        .from("workout_exercises")
        .update(updateData)
        .eq("id", workoutExerciseId)
        .select()
        .single();

    if (updateError) {
      throw new InternalServerErrorException(
        `Failed to update workout exercise: ${updateError.message}`,
      );
    }

    if (!updatedWorkoutExerciseData) {
      throw new InternalServerErrorException(
        "Workout exercise updated but no data returned",
      );
    }

    // Return the updated workout exercise
    return {
      id: updatedWorkoutExerciseData.id,
      workoutId: updatedWorkoutExerciseData.workout_id,
      exerciseId: updatedWorkoutExerciseData.exercise_id,
      orderIndex: updatedWorkoutExerciseData.order_index,
      notes: updatedWorkoutExerciseData.notes,
      createdAt: updatedWorkoutExerciseData.created_at,
      updatedAt: updatedWorkoutExerciseData.updated_at,
      deletedAt: updatedWorkoutExerciseData.deleted_at,
    };
  }

  /**
   * Delete a workout exercise (soft delete).
   * @param workoutId - The ID of the workout (for ownership validation)
   * @param userId - The ID of the user (for ownership validation)
   * @param workoutExerciseId - The ID of the workout exercise to delete
   */
  async deleteWorkoutExercise(
    workoutId: string,
    userId: string,
    workoutExerciseId: string,
  ): Promise<void> {
    // Validate that the workout exists and belongs to the user
    const { data: workoutData, error: workoutError } =
      await this.supabaseService
        .getClient()
        .from("workouts")
        .select("id")
        .eq("id", workoutId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single();

    if (workoutError) {
      if (workoutError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout: ${workoutError.message}`,
      );
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found`);
    }

    // Validate that the workout exercise exists and belongs to the workout
    const { data: workoutExerciseData, error: workoutExerciseError } =
      await this.supabaseService
        .getClient()
        .from("workout_exercises")
        .select("id")
        .eq("id", workoutExerciseId)
        .eq("workout_id", workoutId)
        .is("deleted_at", null)
        .single();

    if (workoutExerciseError) {
      if (workoutExerciseError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(
          `Workout exercise with ID ${workoutExerciseId} not found`,
        );
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout exercise: ${workoutExerciseError.message}`,
      );
    }

    if (!workoutExerciseData) {
      throw new NotFoundException(
        `Workout exercise with ID ${workoutExerciseId} not found`,
      );
    }

    // Soft delete by setting deleted_at to current timestamp
    const { error: deleteError } = await this.supabaseService
      .getClient()
      .from("workout_exercises")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", workoutExerciseId);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete workout exercise: ${deleteError.message}`,
      );
    }
  }

  /**
   * Reorder workout exercises.
   * @param workoutId - The ID of the workout (for ownership validation)
   * @param userId - The ID of the user (for ownership validation)
   * @param dto - The data for reordering (array of ReorderItemDto with id and orderIndex)
   */
  async reorderWorkoutExercises(
    workoutId: string,
    userId: string,
    dto: ReorderWorkoutExercisesDto,
  ): Promise<void> {
    // Validate that the workout exists and belongs to the user
    const { data: workoutData, error: workoutError } =
      await this.supabaseService
        .getClient()
        .from("workouts")
        .select("id")
        .eq("id", workoutId)
        .eq("user_id", userId)
        .is("deleted_at", null)
        .single();

    if (workoutError) {
      if (workoutError.code === "PGRST116") {
        // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutId} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to fetch workout: ${workoutError.message}`,
      );
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutId} not found`);
    }

    // Validate that all workout exercise IDs in the dto belong to the workout and are not deleted
    const { data: existingExercises, error: exError } =
      await this.supabaseService
        .getClient()
        .from("workout_exercises")
        .select("id")
        .eq("workout_id", workoutId)
        .is("deleted_at", null);

    if (exError) {
      throw new InternalServerErrorException(
        `Failed to fetch workout exercises: ${exError.message}`,
      );
    }

    const existingExerciseIds = existingExercises.map((e: any) => e.id);

    // Check that every ID in dto.items exists in existingExerciseIds
    const invalidIds = dto.items
      .map((item) => item.id)
      .filter((id) => !existingExerciseIds.includes(id));
    if (invalidIds.length > 0) {
      throw new NotFoundException(
        `One or more workout exercise IDs not found: ${invalidIds.join(", ")}`,
      );
    }

    // Check that the number of IDs matches (we are reordering all exercises in the workout)
    if (dto.items.length !== existingExerciseIds.length) {
      throw new BadRequestException(
        "The number of workout exercise IDs provided does not match the number of exercises in the workout",
      );
    }

    // Update the order_index for each workout exercise in the dto
    // We'll do this in a loop (Supabase doesn't have a bulk update with different values per row easily)
    // We'll update one by one.
    for (const item of dto.items) {
      const { error: updateError } = await this.supabaseService
        .getClient()
        .from("workout_exercises")
        .update({ order_index: item.orderIndex })
        .eq("id", item.id);

      if (updateError) {
        throw new InternalServerErrorException(
          `Failed to reorder workout exercise: ${updateError.message}`,
        );
      }
    }
  }
}
