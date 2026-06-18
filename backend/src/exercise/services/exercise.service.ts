import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { SupabaseService } from "../../supabase/supabase.service";
import { CreateExerciseDto } from "../dto/create-exercise.dto";
import { UpdateExerciseDto } from "../dto/update-exercise.dto";
import { ExerciseQueryDto } from "../dto/exercise-query.dto";
import { Exercise } from "../interfaces/exercise.interface";
import { ExerciseWithRelations } from "../interfaces/exercise-with-relations.interface";
import {
  MovementPattern,
  DifficultyLevel,
} from "../../common/enums/database.enums";

@Injectable()
export class ExerciseService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get a list of exercises with pagination, search, and filters.
   * @param query - The query parameters
   * @returns Promise of array of exercises with relations
   */
  async getExercises(
    query: ExerciseQueryDto,
  ): Promise<ExerciseWithRelations[]> {
    let db = this.supabaseService.getClient().from("exercises");

    // Apply search
    if (query.search) {
      const searchTerm = `%${query.search}%`;
      db = db.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm},tags.cs.{${query.search}}`,
      );
    }

    // Apply filters
    if (query.muscleGroups && query.muscleGroups.length > 0) {
      // We'll need to join with exercise_muscles and muscles to filter by muscle group names
      // We'll do this after fetching the exercises, or we can use a more complex query.
      // For simplicity, we'll fetch all exercises and then filter by muscle groups in memory.
      // But note: we are to implement filtering, and we should do it at the database level for performance.
      // We'll do a join for muscle groups.
      // We'll do it later in the query building.
    }

    if (query.equipment && query.equipment.length > 0) {
      // Similar to muscle groups, we'll need to join with exercise_equipment and equipment.
    }

    if (query.movementPatterns && query.movementPatterns.length > 0) {
      db = db.in(
        "movement_pattern",
        query.movementPatterns.map((p) => p),
      );
    }

    if (query.difficulties && query.difficulties.length > 0) {
      db = db.in(
        "difficulty",
        query.difficulties.map((d) => d),
      );
    }

    // Apply pagination
    if (query.limit !== undefined) {
      db = db.limit(query.limit);
    }
    if (query.offset !== undefined) {
      db = db.offset(query.offset);
    }

    // Fetch exercises
    const { data: exercisesData, error: exercisesError } = await db.select("*");

    if (exercisesError) {
      throw new InternalServerErrorException(
        `Failed to fetch exercises: ${exercisesError.message}`,
      );
    }

    // Now, for each exercise, fetch the related muscles and equipment
    const exercisesWithRelations: ExerciseWithRelations[] = [];

    for (const exercise of exercisesData) {
      const [musclesData, equipmentData] = await Promise.all([
        this.supabaseService
          .getClient()
          .from("exercise_muscles")
          .select("muscles(name)")
          .eq("exercise_id", exercise.id),
        this.supabaseService
          .getClient()
          .from("exercise_equipment")
          .select("equipment(name)")
          .eq("exercise_id", exercise.id),
      ]);

      const muscleGroups =
        musclesData.data?.map((m: any) => m.muscles.name) || [];
      const equipmentNeeded =
        equipmentData.data?.map((e: any) => e.equipment.name) || [];

      exercisesWithRelations.push({
        ...exercise,
        muscleGroups,
        equipmentNeeded,
      } as ExerciseWithRelations);
    }

    // Now, apply the muscle group and equipment filters if they were provided
    // We'll do it in memory for now, but note: we should have done it at the database level.
    // We'll do it here for simplicity.
    let filteredExercises = exercisesWithRelations;
    if (query.muscleGroups && query.muscleGroups.length > 0) {
      filteredExercises = filteredExercises.filter((ex) =>
        query.muscleGroups!.every((muscle) => ex.muscleGroups.includes(muscle)),
      );
    }
    if (query.equipment && query.equipment.length > 0) {
      filteredExercises = filteredExercises.filter((ex) =>
        query.equipment!.every((equip) => ex.equipmentNeeded.includes(equip)),
      );
    }

    return filteredExercises;
  }

  /**
   * Get a single exercise by ID with relations.
   * @param id - The exercise ID
   * @returns Promise of the exercise with relations or null if not found
   */
  async getExerciseById(id: string): Promise<ExerciseWithRelations | null> {
    const { data: exerciseData, error: exerciseError } =
      await this.supabaseService
        .getClient()
        .from("exercises")
        .select("*")
        .eq("id", id)
        .single();

    if (exerciseError) {
      if (exerciseError.code === "PGRST116") {
        // No rows returned
        return null;
      }
      throw new InternalServerErrorException(
        `Failed to fetch exercise: ${exerciseError.message}`,
      );
    }

    if (!exerciseData) {
      return null;
    }

    // Fetch related muscles and equipment
    const [musclesData, equipmentData] = await Promise.all([
      this.supabaseService
        .getClient()
        .from("exercise_muscles")
        .select("muscles(name)")
        .eq("exercise_id", id),
      this.supabaseService
        .getClient()
        .from("exercise_equipment")
        .select("equipment(name)")
        .eq("exercise_id", id),
    ]);

    const muscleGroups =
      musclesData.data?.map((m: any) => m.muscles.name) || [];
    const equipmentNeeded =
      equipmentData.data?.map((e: any) => e.equipment.name) || [];

    return {
      ...exerciseData,
      muscleGroups,
      equipmentNeeded,
    } as ExerciseWithRelations;
  }

  /**
   * Create a new custom exercise.
   * @param createExerciseDto - The data for the new exercise
   * @param userId - The ID of the user creating the exercise
   * @returns Promise of the created exercise with relations
   */
  async createExercise(
    createExerciseDto: CreateExerciseDto,
    userId: string,
  ): Promise<ExerciseWithRelations> {
    // Validate that the movementPattern and difficulty are valid enums
    // (already done by DTO validation)

    // Look up muscle groups by name
    const muscleGroupNames = createExerciseDto.muscleGroups || [];
    const equipmentNames = createExerciseDto.equipmentNeeded || [];

    // We'll fetch the muscle and equipment IDs from the database
    const [musclesResult, equipmentResult] = await Promise.all([
      muscleGroupNames.length > 0
        ? this.supabaseService
            .getClient()
            .from("muscles")
            .select("id")
            .in("name", muscleGroupNames)
        : Promise.resolve({ data: [], error: null }),
      equipmentNames.length > 0
        ? this.supabaseService
            .getClient()
            .from("equipment")
            .select("id")
            .in("name", equipmentNames)
        : Promise.resolve({ data: [], error: null }),
    ]);

    // Check if all requested muscles and equipment were found
    const foundMuscleNames = musclesResult.data?.map((m: any) => m.name) || [];
    const missingMuscles = muscleGroupNames.filter(
      (name) => !foundMuscleNames.includes(name),
    );
    if (missingMuscles.length > 0) {
      throw new BadRequestException(
        `Muscle groups not found: ${missingMuscles.join(", ")}`,
      );
    }

    const foundEquipmentNames =
      equipmentResult.data?.map((e: any) => e.name) || [];
    const missingEquipment = equipmentNames.filter(
      (name) => !foundEquipmentNames.includes(name),
    );
    if (missingEquipment.length > 0) {
      throw new BadRequestException(
        `Equipment not found: ${missingEquipment.join(", ")}`,
      );
    }

    // Create the exercise
    const exerciseData = {
      name: createExerciseDto.name,
      description: createExerciseDto.description || null,
      movement_pattern: createExerciseDto.movementPattern,
      difficulty: createExerciseDto.difficulty,
      video_url: createExerciseDto.videoUrl || null,
      instructions: createExerciseDto.instructions || null,
      is_custom: true,
      created_by: userId,
      parent_variation_id: createExerciseDto.parentVariationId || null,
      tags: createExerciseDto.tags || [],
      is_active: true,
    };

    const { data: insertedExercise, error: insertError } =
      await this.supabaseService
        .getClient()
        .from("exercises")
        .insert(exerciseData)
        .select()
        .single();

    if (insertError) {
      throw new InternalServerErrorException(
        `Failed to create exercise: ${insertError.message}`,
      );
    }

    if (!insertedExercise) {
      throw new InternalServerErrorException(
        "Exercise created but no data returned",
      );
    }

    // Now, create the relationships in the junction tables
    const muscleIds = musclesResult.data?.map((m: any) => m.id) || [];
    const equipmentIds = equipmentResult.data?.map((e: any) => e.id) || [];

    const exerciseMusclesInserts = muscleIds.map((muscleId: string) => ({
      exercise_id: insertedExercise.id,
      muscle_id: muscleId,
    }));

    const exerciseEquipmentInserts = equipmentIds.map(
      (equipmentId: string) => ({
        exercise_id: insertedExercise.id,
        equipment_id: equipmentId,
      }),
    );

    // Insert the relationships
    if (exerciseMusclesInserts.length > 0) {
      const { error: muscleError } = await this.supabaseService
        .getClient()
        .from("exercise_muscles")
        .insert(exerciseMusclesInserts);

      if (muscleError) {
        // If we fail to insert the relationships, we should clean up the exercise
        await this.supabaseService
          .getClient()
          .from("exercises")
          .delete()
          .eq("id", insertedExercise.id);
        throw new InternalServerErrorException(
          `Failed to create exercise-muscle relationships: ${muscleError.message}`,
        );
      }
    }

    if (exerciseEquipmentInserts.length > 0) {
      const { error: equipmentError } = await this.supabaseService
        .getClient()
        .from("exercise_equipment")
        .insert(exerciseEquipmentInserts);

      if (equipmentError) {
        // Clean up the exercise and the muscle relationships
        await this.supabaseService
          .getClient()
          .from("exercise_equipment")
          .delete()
          .eq("exercise_id", insertedExercise.id);
        await this.supabaseService
          .getClient()
          .from("exercises")
          .delete()
          .eq("id", insertedExercise.id);
        throw new InternalServerErrorException(
          `Failed to create exercise-equipment relationships: ${equipmentError.message}`,
        );
      }
    }

    // Return the created exercise with relations
    const exercise = await this.getExerciseById(insertedExercise.id);
    if (!exercise) {
      throw new InternalServerErrorException("Exercise created but not found");
    }
    return exercise;
  }

  /**
   * Update an existing custom exercise.
   * @param id - The exercise ID
   * @param updateExerciseDto - The data to update
   * @param userId - The ID of the user requesting the update
   * @returns Promise of the updated exercise with relations
   */
  async updateExercise(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
    userId: string,
  ): Promise<ExerciseWithRelations> {
    // First, get the existing exercise to check ownership and current values
    const existingExercise = await this.getExerciseById(id);
    if (!existingExercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    // Check if the exercise is custom and if the user is the creator
    if (existingExercise.isCustom && existingExercise.createdBy !== userId) {
      throw new BadRequestException(
        "You are not authorized to update this exercise",
      );
    }

    // We'll build the update object
    const updateData: any = {};

    if (updateExerciseDto.name !== undefined) {
      updateData.name = updateExerciseDto.name;
    }
    if (updateExerciseDto.description !== undefined) {
      updateData.description = updateExerciseDto.description ?? null;
    }
    if (updateExerciseDto.movementPattern !== undefined) {
      updateData.movement_pattern = updateExerciseDto.movementPattern;
    }
    if (updateExerciseDto.difficulty !== undefined) {
      updateData.difficulty = updateExerciseDto.difficulty;
    }
    if (updateExerciseDto.videoUrl !== undefined) {
      updateData.video_url = updateExerciseDto.videoUrl ?? null;
    }
    if (updateExerciseDto.instructions !== undefined) {
      updateData.instructions = updateExerciseDto.instructions ?? null;
    }
    if (updateExerciseDto.tags !== undefined) {
      updateData.tags = updateExerciseDto.tags;
    }
    // Note: We are not allowing to change is_custom, created_by, parent_variation_id, or is_active via this endpoint.
    // If we want to allow those, we would add them to the DTO and handle them here.

    // If there are no updates, we can return the existing exercise
    if (Object.keys(updateData).length === 0) {
      return existingExercise;
    }

    // Update the exercise
    const { data: updatedExerciseData, error: updateError } =
      await this.supabaseService
        .getClient()
        .from("exercises")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

    if (updateError) {
      throw new InternalServerErrorException(
        `Failed to update exercise: ${updateError.message}`,
      );
    }

    if (!updatedExerciseData) {
      throw new InternalServerErrorException(
        "Exercise updated but no data returned",
      );
    }

    // Now, handle the relationships if muscleGroups or equipmentNeeded were provided in the DTO
    // We'll replace the existing relationships with the new ones.
    // We'll delete the old ones and insert the new ones.

    // We'll only do this if the DTO provided muscleGroups or equipmentNeeded
    const updateMuscleGroups = updateExerciseDto.muscleGroups;
    const updateEquipmentNeeded = updateExerciseDto.equipmentNeeded;

    if (
      updateMuscleGroups !== undefined ||
      updateEquipmentNeeded !== undefined
    ) {
      // Delete existing relationships
      await this.supabaseService
        .getClient()
        .from("exercise_muscles")
        .delete()
        .eq("exercise_id", id);

      await this.supabaseService
        .getClient()
        .from("exercise_equipment")
        .delete()
        .eq("exercise_id", id);

      // If muscleGroups were provided, insert new ones
      if (updateMuscleGroups !== undefined) {
        // Look up the muscle IDs
        const musclesResult = await this.supabaseService
          .getClient()
          .from("muscles")
          .select("id")
          .in("name", updateMuscleGroups);

        if (musclesResult.error) {
          throw new InternalServerErrorException(
            `Failed to lookup muscles: ${musclesResult.error.message}`,
          );
        }

        const foundMuscleNames =
          musclesResult.data?.map((m: any) => m.name) || [];
        const missingMuscles = updateMuscleGroups.filter(
          (name) => !foundMuscleNames.includes(name),
        );
        if (missingMuscles.length > 0) {
          throw new BadRequestException(
            `Muscle groups not found: ${missingMuscles.join(", ")}`,
          );
        }

        const muscleIds = musclesResult.data?.map((m: any) => m.id) || [];
        const exerciseMusclesInserts = muscleIds.map((muscleId: string) => ({
          exercise_id: id,
          muscle_id: muscleId,
        }));

        if (exerciseMusclesInserts.length > 0) {
          const { error: muscleError } = await this.supabaseService
            .getClient()
            .from("exercise_muscles")
            .insert(exerciseMusclesInserts);

          if (muscleError) {
            throw new InternalServerErrorException(
              `Failed to create exercise-muscle relationships: ${muscleError.message}`,
            );
          }
        }
      }

      // If equipmentNeeded were provided, insert new ones
      if (updateEquipmentNeeded !== undefined) {
        // Look up the equipment IDs
        const equipmentResult = await this.supabaseService
          .getClient()
          .from("equipment")
          .select("id")
          .in("name", updateEquipmentNeeded);

        if (equipmentResult.error) {
          throw new InternalServerErrorException(
            `Failed to lookup equipment: ${equipmentResult.error.message}`,
          );
        }

        const foundEquipmentNames =
          equipmentResult.data?.map((e: any) => e.name) || [];
        const missingEquipment = updateEquipmentNeeded.filter(
          (name) => !foundEquipmentNames.includes(name),
        );
        if (missingEquipment.length > 0) {
          throw new BadRequestException(
            `Equipment not found: ${missingEquipment.join(", ")}`,
          );
        }

        const equipmentIds = equipmentResult.data?.map((e: any) => e.id) || [];
        const exerciseEquipmentInserts = equipmentIds.map(
          (equipmentId: string) => ({
            exercise_id: id,
            equipment_id: equipmentId,
          }),
        );

        if (exerciseEquipmentInserts.length > 0) {
          const { error: equipmentError } = await this.supabaseService
            .getClient()
            .from("exercise_equipment")
            .insert(exerciseEquipmentInserts);

          if (equipmentError) {
            throw new InternalServerErrorException(
              `Failed to create exercise-equipment relationships: ${equipmentError.message}`,
            );
          }
        }
      }
    }

    // Return the updated exercise with relations
    const exercise = await this.getExerciseById(id);
    if (!exercise) {
      throw new InternalServerErrorException("Exercise updated but not found");
    }
    return exercise;
  }

  /**
   * Delete a custom exercise.
   * @param id - The exercise ID
   * @param userId - The ID of the user requesting the deletion
   */
  async deleteExercise(id: string, userId: string): Promise<void> {
    // First, get the existing exercise to check ownership
    const existingExercise = await this.getExerciseById(id);
    if (!existingExercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
    }

    // Check if the exercise is custom and if the user is the creator
    if (existingExercise.isCustom && existingExercise.createdBy !== userId) {
      throw new BadRequestException(
        "You are not authorized to delete this exercise",
      );
    }

    // Delete the relationships first (due to foreign key constraints)
    await this.supabaseService
      .getClient()
      .from("exercise_muscles")
      .delete()
      .eq("exercise_id", id);

    await this.supabaseService
      .getClient()
      .from("exercise_equipment")
      .delete()
      .eq("exercise_id", id);

    // Delete the exercise
    const { error: deleteError } = await this.supabaseService
      .getClient()
      .from("exercises")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new InternalServerErrorException(
        `Failed to delete exercise: ${deleteError.message}`,
      );
    }
  }
}
