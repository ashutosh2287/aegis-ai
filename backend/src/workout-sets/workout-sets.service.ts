import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateWorkoutSetDto } from './dto/create-workout-set.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { ReorderWorkoutSetsDto } from './dto/reorder-workout-sets.dto';
import { WorkoutSet } from './interfaces/workout-set.interface';

@Injectable()
export class WorkoutSetsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Create a set for a workout exercise.
   * @param workoutExerciseId - The ID of the workout exercise
   * @param userId - The ID of the user (for ownership validation)
   * @param dto - The data for creating the set
   * @returns Promise of the created set
   */
  async createSet(
    workoutExerciseId: string,
    userId: string,
    dto: CreateWorkoutSetDto,
  ): Promise<WorkoutSet> {
    // Validate that the workout exercise exists and belongs to the user via workout
    const { data: workoutExerciseData, error: workoutExerciseError } = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id, workout_id')
      .eq('id', workoutExerciseId)
      .is('deleted_at', null)
      .single();

    if (workoutExerciseError) {
      if (workoutExerciseError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout exercise: ${workoutExerciseError.message}`);
    }

    if (!workoutExerciseData) {
      throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
    }

    // Validate that the workout belongs to the user
    const { data: workoutData, error: workoutError } = await this.supabaseService
      .getClient()
      .from('workouts')
      .select('id')
      .eq('id', workoutExerciseData.workout_id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (workoutError) {
      if (workoutError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout: ${workoutError.message}`);
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
    }

    // Get the current maximum set_number for this workout exercise to set the new set at the end
    const { data: setData, error: setError } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('set_number')
      .eq('workout_exercise_id', workoutExerciseId)
      .is('deleted_at', null)
      .order('set_number', { ascending: false })
      .limit(1);

    let setNumber = 1;
    if (!setError && setData && setData.length > 0) {
      setNumber = setData[0].set_number + 1;
    }

    // Create the workout_set record
    const workoutSetData = {
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      reps: dto.reps,
      weight: dto.weight ?? null,
      rpe: dto.rpe ?? null,
      notes: dto.notes ?? null,
    };

    const { data: workoutSetDataResult, error: workoutSetError } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .insert(workoutSetData)
      .select()
      .single();

    if (workoutSetError) {
      throw new InternalServerErrorException(`Failed to create set: ${workoutSetError.message}`);
    }

    if (!workoutSetDataResult) {
      throw new InternalServerErrorException('Set created but no data returned');
    }

    // Return the created set
    return {
      id: workoutSetDataResult.id,
      workoutExerciseId: workoutSetDataResult.workout_exercise_id,
      setNumber: workoutSetDataResult.set_number,
      reps: workoutSetDataResult.reps,
      weight: workoutSetDataResult.weight,
      rpe: workoutSetDataResult.rpe,
      notes: workoutSetDataResult.notes,
      createdAt: workoutSetDataResult.created_at,
      updatedAt: workoutSetDataResult.updated_at,
      deletedAt: workoutSetDataResult.deleted_at,
    };
  }

  /**
   * Get all sets for a workout exercise, ordered by set_number.
   * @param workoutExerciseId - The ID of the workout exercise
   * @param userId - The ID of the user (for ownership validation)
   * @returns Promise of array of sets
   */
  async getWorkoutSets(
    workoutExerciseId: string,
    userId: string,
  ): Promise<WorkoutSet[]> {
    // Validate that the workout exercise exists and belongs to the user via workout
    const { data: workoutExerciseData, error: workoutExerciseError } = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id, workout_id')
      .eq('id', workoutExerciseId)
      .is('deleted_at', null)
      .single();

    if (workoutExerciseError) {
      if (workoutExerciseError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout exercise: ${workoutExerciseError.message}`);
    }

    if (!workoutExerciseData) {
      throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
    }

    // Validate that the workout belongs to the user
    const { data: workoutData, error: workoutError } = await this.supabaseService
      .getClient()
      .from('workouts')
      .select('id')
      .eq('id', workoutExerciseData.workout_id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (workoutError) {
      if (workoutError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout: ${workoutError.message}`);
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
    }

    // Get the workout sets for this workout exercise, ordered by set_number
    const { data: setsData, error: setsError } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('*')
      .eq('workout_exercise_id', workoutExerciseId)
      .is('deleted_at', null)
      .order('set_number', { ascending: true });

    if (setsError) {
      throw new InternalServerErrorException(`Failed to fetch workout sets: ${setsError.message}`);
    }

    // Map the data to the WorkoutSet interface
    const workoutSets: WorkoutSet[] = setsData.map((set: any) => ({
      id: set.id,
      workoutExerciseId: set.workout_exercise_id,
      setNumber: set.set_number,
      reps: set.reps,
      weight: set.weight,
      rpe: set.rpe,
      notes: set.notes,
      createdAt: set.created_at,
      updatedAt: set.updated_at,
      deletedAt: set.deleted_at,
    }));

    return workoutSets;
  }

  /**
   * Update a set.
   * @param workoutExerciseId - The ID of the workout exercise (for ownership validation)
   * @param userId - The ID of the user (for ownership validation)
   * @param setId - The ID of the set to update
   * @param dto - The data for updating the set
   * @returns Promise of the updated set
   */
  async updateSet(
    workoutExerciseId: string,
    userId: string,
    setId: string,
    dto: UpdateWorkoutSetDto,
  ): Promise<WorkoutSet> {
    // Validate that the workout exercise exists and belongs to the user via workout
    const { data: workoutExerciseData, error: workoutExerciseError } = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id, workout_id')
      .eq('id', workoutExerciseId)
      .is('deleted_at', null)
      .single();

    if (workoutExerciseError) {
      if (workoutExerciseError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout exercise: ${workoutExerciseError.message}`);
    }

    if (!workoutExerciseData) {
      throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
    }

    // Validate that the workout belongs to the user
    const { data: workoutData, error: workoutError } = await this.supabaseService
      .getClient()
      .from('workouts')
      .select('id')
      .eq('id', workoutExerciseData.workout_id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (workoutError) {
      if (workoutError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout: ${workoutError.message}`);
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
    }

    // Validate that the set exists and belongs to the workout exercise
    const { data: setData, error: setError } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('*')
      .eq('id', setId)
      .eq('workout_exercise_id', workoutExerciseId)
      .is('deleted_at', null)
      .single();

    if (setError) {
      if (setError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Set with ID ${setId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch set: ${setError.message}`);
    }

    if (!setData) {
      throw new NotFoundException(`Set with ID ${setId} not found`);
    }

    // Update the set
    const updateData: any = {};
    if (dto.reps !== undefined) {
      updateData.reps = dto.reps;
    }
    if (dto.weight !== undefined) {
      updateData.weight = dto.weight ?? null;
    }
    if (dto.rpe !== undefined) {
      updateData.rpe = dto.rpe ?? null;
    }
    if (dto.notes !== undefined) {
      updateData.notes = dto.notes ?? null;
    }

    // If there are no fields to update, return the existing set
    if (Object.keys(updateData).length === 0) {
      return {
        id: setData.id,
        workoutExerciseId: setData.workout_exercise_id,
        setNumber: setData.set_number,
        reps: setData.reps,
        weight: setData.weight,
        rpe: setData.rpe,
        notes: setData.notes,
        createdAt: setData.created_at,
        updatedAt: setData.updated_at,
        deletedAt: setData.deleted_at,
      };
    }

    const { data: updatedSetData, error: updateError } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .update(updateData)
      .eq('id', setId)
      .select()
      .single();

    if (updateError) {
      throw new InternalServerErrorException(`Failed to update set: ${updateError.message}`);
    }

    if (!updatedSetData) {
      throw new InternalServerErrorException('Set updated but no data returned');
    }

    // Return the updated set
    return {
      id: updatedSetData.id,
      workoutExerciseId: updatedSetData.workout_exercise_id,
      setNumber: updatedSetData.set_number,
      reps: updatedSetData.reps,
      weight: updatedSetData.weight,
      rpe: updatedSetData.rpe,
      notes: updatedSetData.notes,
      createdAt: updatedSetData.created_at,
      updatedAt: updatedSetData.updated_at,
      deletedAt: updatedSetData.deleted_at,
    };
  }

  /**
   * Delete a set (soft delete).
   * @param workoutExerciseId - The ID of the workout exercise (for ownership validation)
   * @param userId - The ID of the user (for ownership validation)
   * @param setId - The ID of the set to delete
   */
  async deleteSet(
    workoutExerciseId: string,
    userId: string,
    setId: string,
  ): Promise<void> {
    // Validate that the workout exercise exists and belongs to the user via workout
    const { data: workoutExerciseData, error: workoutExerciseError } = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id, workout_id')
      .eq('id', workoutExerciseId)
      .is('deleted_at', null)
      .single();

    if (workoutExerciseError) {
      if (workoutExerciseError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout exercise: ${workoutExerciseError.message}`);
    }

    if (!workoutExerciseData) {
      throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
    }

    // Validate that the workout belongs to the user
    const { data: workoutData, error: workoutError } = await this.supabaseService
      .getClient()
      .from('workouts')
      .select('id')
      .eq('id', workoutExerciseData.workout_id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (workoutError) {
      if (workoutError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout: ${workoutError.message}`);
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
    }

    // Validate that the set exists and belongs to the workout exercise
    const { data: setData, error: setError } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('id')
      .eq('id', setId)
      .eq('workout_exercise_id', workoutExerciseId)
      .is('deleted_at', null)
      .single();

    if (setError) {
      if (setError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Set with ID ${setId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch set: ${setError.message}`);
    }

    if (!setData) {
      throw new NotFoundException(`Set with ID ${setId} not found`);
    }

    // Soft delete by setting deleted_at to current timestamp
    const { error: deleteError } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', setId);

    if (deleteError) {
      throw new InternalServerErrorException(`Failed to delete set: ${deleteError.message}`);
    }
  }

  /**
   * Reorder sets for a workout exercise.
   * @param workoutExerciseId - The ID of the workout exercise (for ownership validation)
   * @param userId - The ID of the user (for ownership validation)
   * @param dto - The data for reordering (array of items with id and setNumber)
   */
  async reorderSets(
    workoutExerciseId: string,
    userId: string,
    dto: ReorderWorkoutSetsDto,
  ): Promise<void> {
    // Validate that the workout exercise exists and belongs to the user via workout
    const { data: workoutExerciseData, error: workoutExerciseError } = await this.supabaseService
      .getClient()
      .from('workout_exercises')
      .select('id, workout_id')
      .eq('id', workoutExerciseId)
      .is('deleted_at', null)
      .single();

    if (workoutExerciseError) {
      if (workoutExerciseError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout exercise: ${workoutExerciseError.message}`);
    }

    if (!workoutExerciseData) {
      throw new NotFoundException(`Workout exercise with ID ${workoutExerciseId} not found`);
    }

    // Validate that the workout belongs to the user
    const { data: workoutData, error: workoutError } = await this.supabaseService
      .getClient()
      .from('workouts')
      .select('id')
      .eq('id', workoutExerciseData.workout_id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (workoutError) {
      if (workoutError.code === 'PGRST116') { // No rows returned
        throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
      }
      throw new InternalServerErrorException(`Failed to fetch workout: ${workoutError.message}`);
    }

    if (!workoutData) {
      throw new NotFoundException(`Workout with ID ${workoutExerciseData.workout_id} not found`);
    }

    // Validate that all set IDs in the dto belong to the workout exercise and are not deleted
    const { data: existingSets, error: setsError } = await this.supabaseService
      .getClient()
      .from('workout_sets')
      .select('id')
      .eq('workout_exercise_id', workoutExerciseId)
      .is('deleted_at', null);

    if (setsError) {
      throw new InternalServerErrorException(`Failed to fetch workout sets: ${setsError.message}`);
    }

    const existingSetIds = existingSets.map((set: any) => set.id);

    // Check that every ID in dto.items exists in existingSetIds
    const invalidIds = dto.items.map(item => item.id).filter(id => !existingSetIds.includes(id));
    if (invalidIds.length > 0) {
      throw new NotFoundException(`One or more set IDs not found: ${invalidIds.join(', ')}`);
    }

    // Check that the number of IDs matches (we are reordering all sets in the workout exercise)
    if (dto.items.length !== existingSetIds.length) {
      throw new BadRequestException('The number of set IDs provided does not match the number of sets in the workout exercise');
    }

    // Update the set_number for each set in the dto
    // We'll do this in a loop (Supabase doesn't have a bulk update with different values per row easily)
    for (const item of dto.items) {
      const { error: updateError } = await this.supabaseService
        .getClient()
        .from('workout_sets')
        .update({ set_number: item.setNumber })
        .eq('id', item.id);

      if (updateError) {
        throw new InternalServerErrorException(`Failed to reorder set: ${updateError.message}`);
      }
    }
  }
}