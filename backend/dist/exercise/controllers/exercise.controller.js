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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExerciseController = void 0;
const common_1 = require("@nestjs/common");
const exercise_service_1 = require("../services/exercise.service");
const create_exercise_dto_1 = require("../dto/create-exercise.dto");
const update_exercise_dto_1 = require("../dto/update-exercise.dto");
const exercise_query_dto_1 = require("../dto/exercise-query.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let ExerciseController = class ExerciseController {
    constructor(exerciseService) {
        this.exerciseService = exerciseService;
    }
    async getExercises(query) {
        const exercises = await this.exerciseService.getExercises(query);
        return exercises.map(exercise => ({
            id: exercise.id,
            name: exercise.name,
            description: exercise.description === null ? undefined : exercise.description,
            movementPattern: exercise.movementPattern,
            difficulty: exercise.difficulty,
            videoUrl: exercise.videoUrl === null ? undefined : exercise.videoUrl,
            instructions: exercise.instructions === null ? undefined : exercise.instructions,
            isCustom: exercise.isCustom,
            createdBy: exercise.createdBy === null ? undefined : exercise.createdBy,
            parentVariationId: exercise.parentVariationId === null ? undefined : exercise.parentVariationId,
            tags: exercise.tags,
            isActive: exercise.isActive,
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
            muscleGroups: exercise.muscleGroups,
            equipmentNeeded: exercise.equipmentNeeded,
        }));
    }
    async getExerciseById(id) {
        const exercise = await this.exerciseService.getExerciseById(id);
        if (!exercise) {
            throw new common_1.NotFoundException(`Exercise with ID ${id} not found`);
        }
        return {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description === null ? undefined : exercise.description,
            movementPattern: exercise.movementPattern,
            difficulty: exercise.difficulty,
            videoUrl: exercise.videoUrl === null ? undefined : exercise.videoUrl,
            instructions: exercise.instructions === null ? undefined : exercise.instructions,
            isCustom: exercise.isCustom,
            createdBy: exercise.createdBy === null ? undefined : exercise.createdBy,
            parentVariationId: exercise.parentVariationId === null ? undefined : exercise.parentVariationId,
            tags: exercise.tags,
            isActive: exercise.isActive,
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
            muscleGroups: exercise.muscleGroups === null ? undefined : exercise.muscleGroups,
            equipmentNeeded: exercise.equipmentNeeded === null ? undefined : exercise.equipmentNeeded,
        };
    }
    async createExercise(createExerciseDto, req) {
        const user = req.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const userId = user.id;
        const exercise = await this.exerciseService.createExercise(createExerciseDto, userId);
        return {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description === null ? undefined : exercise.description,
            movementPattern: exercise.movementPattern,
            difficulty: exercise.difficulty,
            videoUrl: exercise.videoUrl === null ? undefined : exercise.videoUrl,
            instructions: exercise.instructions === null ? undefined : exercise.instructions,
            isCustom: exercise.isCustom,
            createdBy: exercise.createdBy === null ? undefined : exercise.createdBy,
            parentVariationId: exercise.parentVariationId === null ? undefined : exercise.parentVariationId,
            tags: exercise.tags,
            isActive: exercise.isActive,
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
            muscleGroups: exercise.muscleGroups === null ? undefined : exercise.muscleGroups,
            equipmentNeeded: exercise.equipmentNeeded === null ? undefined : exercise.equipmentNeeded,
        };
    }
    async updateExercise(id, updateExerciseDto, req) {
        const user = req.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const userId = user.id;
        const exercise = await this.exerciseService.updateExercise(id, updateExerciseDto, userId);
        return {
            id: exercise.id,
            name: exercise.name,
            description: exercise.description === null ? undefined : exercise.description,
            movementPattern: exercise.movementPattern,
            difficulty: exercise.difficulty,
            videoUrl: exercise.videoUrl === null ? undefined : exercise.videoUrl,
            instructions: exercise.instructions === null ? undefined : exercise.instructions,
            isCustom: exercise.isCustom,
            createdBy: exercise.createdBy === null ? undefined : exercise.createdBy,
            parentVariationId: exercise.parentVariationId === null ? undefined : exercise.parentVariationId,
            tags: exercise.tags,
            isActive: exercise.isActive,
            createdAt: exercise.createdAt,
            updatedAt: exercise.updatedAt,
            muscleGroups: exercise.muscleGroups === null ? undefined : exercise.muscleGroups,
            equipmentNeeded: exercise.equipmentNeeded === null ? undefined : exercise.equipmentNeeded,
        };
    }
    async deleteExercise(id, req) {
        const user = req.user;
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const userId = user.id;
        await this.exerciseService.deleteExercise(id, userId);
        return { message: 'Exercise deleted successfully' };
    }
};
exports.ExerciseController = ExerciseController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List exercises with pagination, search, and filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return a list of exercises' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exercise_query_dto_1.ExerciseQueryDto]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getExercises", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exercise details by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Return the exercise details' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Exercise not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "getExerciseById", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new custom exercise' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Exercise created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_exercise_dto_1.CreateExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "createExercise", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Update an existing custom exercise' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exercise updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Exercise not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_exercise_dto_1.UpdateExerciseDto, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "updateExercise", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a custom exercise' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Exercise deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Exercise not found' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal server error' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExerciseController.prototype, "deleteExercise", null);
exports.ExerciseController = ExerciseController = __decorate([
    (0, common_1.Controller)('exercises'),
    (0, swagger_1.ApiTags)('exercises'),
    __metadata("design:paramtypes", [exercise_service_1.ExerciseService])
], ExerciseController);
//# sourceMappingURL=exercise.controller.js.map