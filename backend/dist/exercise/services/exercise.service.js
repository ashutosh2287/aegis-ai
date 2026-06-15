"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../../supabase/supabase.service");
let ExerciseService = class ExerciseService {
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getExercises(query) {
        let db = this.supabaseService.getClient().from('exercises');
        if (query.search) {
            const searchTerm = `%${query.search}%`;
            db = db.or(`name.ilike.${searchTerm},description.ilike.${searchTerm},tags.cs.{${query.search}}`);
        }
        if (query.muscleGroups && query.muscleGroups.length > 0) {
        }
        if (query.equipment && query.equipment.length > 0) {
        }
        if (query.movementPatterns && query.movementPatterns.length > 0) {
            db = db.in('movement_pattern', query.movementPatterns.map(p => p));
        }
        if (query.difficulties && query.difficulties.length > 0) {
            db = db.in('difficulty', query.difficulties.map(d => d));
        }
        if (query.limit !== undefined) {
            db = db.limit(query.limit);
        }
        if (query.offset !== undefined) {
            db = db.offset(query.offset);
        }
        const { data: exercisesData, error: exercisesError } = await db.select('*');
        if (exercisesError) {
            throw new common_1.InternalServerErrorException(`Failed to fetch exercises: ${exercisesError.message}`);
        }
        const exercisesWithRelations = [];
        for (const exercise of exercisesData) {
            const [musclesData, equipmentData] = await Promise.all([
                this.supabaseService.getClient()
                    .from('exercise_muscles')
                    .select('muscles(name)')
                    .eq('exercise_id', exercise.id),
                this.supabaseService.getClient()
                    .from('exercise_equipment')
                    .select('equipment(name)')
                    .eq('exercise_id', exercise.id),
            ]);
            const muscleGroups = musclesData.data?.map((m) => m.muscles.name) || [];
            const equipmentNeeded = equipmentData.data?.map((e) => e.equipment.name) || [];
            exercisesWithRelations.push({
                ...exercise,
                muscleGroups,
                equipmentNeeded,
            });
        }
        let filteredExercises = exercisesWithRelations;
        if (query.muscleGroups && query.muscleGroups.length > 0) {
            filteredExercises = filteredExercises.filter(ex => query.muscleGroups.every(muscle => ex.muscleGroups.includes(muscle)));
        }
        if (query.equipment && query.equipment.length > 0) {
            filteredExercises = filteredExercises.filter(ex => query.equipment.every(equip => ex.equipmentNeeded.includes(equip)));
        }
        return filteredExercises;
    }
    async getExerciseById(id) {
        const { data: exerciseData, error: exerciseError } = await this.supabaseService
            .getClient()
            .from('exercises')
            .select('*')
            .eq('id', id)
            .single();
        if (exerciseError) {
            if (exerciseError.code === 'PGRST116') {
                return null;
            }
            throw new common_1.InternalServerErrorException(`Failed to fetch exercise: ${exerciseError.message}`);
        }
        if (!exerciseData) {
            return null;
        }
        const [musclesData, equipmentData] = await Promise.all([
            this.supabaseService.getClient()
                .from('exercise_muscles')
                .select('muscles(name)')
                .eq('exercise_id', id),
            this.supabaseService.getClient()
                .from('exercise_equipment')
                .select('equipment(name)')
                .eq('exercise_id', id),
        ]);
        const muscleGroups = musclesData.data?.map((m) => m.muscles.name) || [];
        const equipmentNeeded = equipmentData.data?.map((e) => e.equipment.name) || [];
        return {
            ...exerciseData,
            muscleGroups,
            equipmentNeeded,
        };
    }
    async createExercise(createExerciseDto, userId) {
        const muscleGroupNames = createExerciseDto.muscleGroups || [];
        const equipmentNames = createExerciseDto.equipmentNeeded || [];
        const [musclesResult, equipmentResult] = await Promise.all([
            muscleGroupNames.length > 0
                ? this.supabaseService.getClient()
                    .from('muscles')
                    .select('id')
                    .in('name', muscleGroupNames)
                : Promise.resolve({ data: [], error: null }),
            equipmentNames.length > 0
                ? this.supabaseService.getClient()
                    .from('equipment')
                    .select('id')
                    .in('name', equipmentNames)
                : Promise.resolve({ data: [], error: null }),
        ]);
        const foundMuscleNames = musclesResult.data?.map((m) => m.name) || [];
        const missingMuscles = muscleGroupNames.filter(name => !foundMuscleNames.includes(name));
        if (missingMuscles.length > 0) {
            throw new common_1.BadRequestException(`Muscle groups not found: ${missingMuscles.join(', ')}`);
        }
        const foundEquipmentNames = equipmentResult.data?.map((e) => e.name) || [];
        const missingEquipment = equipmentNames.filter(name => !foundEquipmentNames.includes(name));
        if (missingEquipment.length > 0) {
            throw new common_1.BadRequestException(`Equipment not found: ${missingEquipment.join(', ')}`);
        }
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
        const { data: insertedExercise, error: insertError } = await this.supabaseService
            .getClient()
            .from('exercises')
            .insert(exerciseData)
            .select()
            .single();
        if (insertError) {
            throw new common_1.InternalServerErrorException(`Failed to create exercise: ${insertError.message}`);
        }
        if (!insertedExercise) {
            throw new common_1.InternalServerErrorException('Exercise created but no data returned');
        }
        const muscleIds = musclesResult.data?.map((m) => m.id) || [];
        const equipmentIds = equipmentResult.data?.map((e) => e.id) || [];
        const exerciseMusclesInserts = muscleIds.map((muscleId) => ({
            exercise_id: insertedExercise.id,
            muscle_id: muscleId,
        }));
        const exerciseEquipmentInserts = equipmentIds.map((equipmentId) => ({
            exercise_id: insertedExercise.id,
            equipment_id: equipmentId,
        }));
        if (exerciseMusclesInserts.length > 0) {
            const { error: muscleError } = await this.supabaseService
                .getClient()
                .from('exercise_muscles')
                .insert(exerciseMusclesInserts);
            if (muscleError) {
                await this.supabaseService.getClient()
                    .from('exercises')
                    .delete()
                    .eq('id', insertedExercise.id);
                throw new common_1.InternalServerErrorException(`Failed to create exercise-muscle relationships: ${muscleError.message}`);
            }
        }
        if (exerciseEquipmentInserts.length > 0) {
            const { error: equipmentError } = await this.supabaseService
                .getClient()
                .from('exercise_equipment')
                .insert(exerciseEquipmentInserts);
            if (equipmentError) {
                await this.supabaseService.getClient()
                    .from('exercise_equipment')
                    .delete()
                    .eq('exercise_id', insertedExercise.id);
                await this.supabaseService.getClient()
                    .from('exercises')
                    .delete()
                    .eq('id', insertedExercise.id);
                throw new common_1.InternalServerErrorException(`Failed to create exercise-equipment relationships: ${equipmentError.message}`);
            }
        }
        const exercise = await this.getExerciseById(insertedExercise.id);
        if (!exercise) {
            throw new common_1.InternalServerErrorException('Exercise created but not found');
        }
        return exercise;
    }
    async updateExercise(id, updateExerciseDto, userId) {
        const existingExercise = await this.getExerciseById(id);
        if (!existingExercise) {
            throw new common_1.NotFoundException(`Exercise with ID ${id} not found`);
        }
        if (existingExercise.isCustom && existingExercise.createdBy !== userId) {
            throw new common_1.BadRequestException('You are not authorized to update this exercise');
        }
        const updateData = {};
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
        if (Object.keys(updateData).length === 0) {
            return existingExercise;
        }
        const { data: updatedExerciseData, error: updateError } = await this.supabaseService
            .getClient()
            .from('exercises')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
        if (updateError) {
            throw new common_1.InternalServerErrorException(`Failed to update exercise: ${updateError.message}`);
        }
        if (!updatedExerciseData) {
            throw new common_1.InternalServerErrorException('Exercise updated but no data returned');
        }
        const updateMuscleGroups = updateExerciseDto.muscleGroups;
        const updateEquipmentNeeded = updateExerciseDto.equipmentNeeded;
        if (updateMuscleGroups !== undefined || updateEquipmentNeeded !== undefined) {
            await this.supabaseService.getClient()
                .from('exercise_muscles')
                .delete()
                .eq('exercise_id', id);
            await this.supabaseService.getClient()
                .from('exercise_equipment')
                .delete()
                .eq('exercise_id', id);
            if (updateMuscleGroups !== undefined) {
                const musclesResult = await this.supabaseService.getClient()
                    .from('muscles')
                    .select('id')
                    .in('name', updateMuscleGroups);
                if (musclesResult.error) {
                    throw new common_1.InternalServerErrorException(`Failed to lookup muscles: ${musclesResult.error.message}`);
                }
                const foundMuscleNames = musclesResult.data?.map((m) => m.name) || [];
                const missingMuscles = updateMuscleGroups.filter(name => !foundMuscleNames.includes(name));
                if (missingMuscles.length > 0) {
                    throw new common_1.BadRequestException(`Muscle groups not found: ${missingMuscles.join(', ')}`);
                }
                const muscleIds = musclesResult.data?.map((m) => m.id) || [];
                const exerciseMusclesInserts = muscleIds.map((muscleId) => ({
                    exercise_id: id,
                    muscle_id: muscleId,
                }));
                if (exerciseMusclesInserts.length > 0) {
                    const { error: muscleError } = await this.supabaseService.getClient()
                        .from('exercise_muscles')
                        .insert(exerciseMusclesInserts);
                    if (muscleError) {
                        throw new common_1.InternalServerErrorException(`Failed to create exercise-muscle relationships: ${muscleError.message}`);
                    }
                }
            }
            if (updateEquipmentNeeded !== undefined) {
                const equipmentResult = await this.supabaseService.getClient()
                    .from('equipment')
                    .select('id')
                    .in('name', updateEquipmentNeeded);
                if (equipmentResult.error) {
                    throw new common_1.InternalServerErrorException(`Failed to lookup equipment: ${equipmentResult.error.message}`);
                }
                const foundEquipmentNames = equipmentResult.data?.map((e) => e.name) || [];
                const missingEquipment = updateEquipmentNeeded.filter(name => !foundEquipmentNames.includes(name));
                if (missingEquipment.length > 0) {
                    throw new common_1.BadRequestException(`Equipment not found: ${missingEquipment.join(', ')}`);
                }
                const equipmentIds = equipmentResult.data?.map((e) => e.id) || [];
                const exerciseEquipmentInserts = equipmentIds.map((equipmentId) => ({
                    exercise_id: id,
                    equipment_id: equipmentId,
                }));
                if (exerciseEquipmentInserts.length > 0) {
                    const { error: equipmentError } = await this.supabaseService.getClient()
                        .from('exercise_equipment')
                        .insert(exerciseEquipmentInserts);
                    if (equipmentError) {
                        throw new common_1.InternalServerErrorException(`Failed to create exercise-equipment relationships: ${equipmentError.message}`);
                    }
                }
            }
        }
        const exercise = await this.getExerciseById(id);
        if (!exercise) {
            throw new common_1.InternalServerErrorException('Exercise updated but not found');
        }
        return exercise;
    }
    async deleteExercise(id, userId) {
        const existingExercise = await this.getExerciseById(id);
        if (!existingExercise) {
            throw new common_1.NotFoundException(`Exercise with ID ${id} not found`);
        }
        if (existingExercise.isCustom && existingExercise.createdBy !== userId) {
            throw new common_1.BadRequestException('You are not authorized to delete this exercise');
        }
        await this.supabaseService.getClient()
            .from('exercise_muscles')
            .delete()
            .eq('exercise_id', id);
        await this.supabaseService.getClient()
            .from('exercise_equipment')
            .delete()
            .eq('exercise_id', id);
        const { error: deleteError } = await this.supabaseService.getClient()
            .from('exercises')
            .delete()
            .eq('id', id);
        if (deleteError) {
            throw new common_1.InternalServerErrorException(`Failed to delete exercise: ${deleteError.message}`);
        }
    }
};
exports.ExerciseService = ExerciseService;
exports.ExerciseService = ExerciseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService])
], ExerciseService);
//# sourceMappingURL=exercise.service.js.map