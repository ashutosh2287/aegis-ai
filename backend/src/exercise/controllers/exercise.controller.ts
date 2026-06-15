import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { ExerciseService } from '../services/exercise.service';
import { CreateExerciseDto } from '../dto/create-exercise.dto';
import { UpdateExerciseDto } from '../dto/update-exercise.dto';
import { ExerciseQueryDto } from '../dto/exercise-query.dto';
import { ExerciseResponseDto } from '../dto/exercise-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('exercises')
@ApiTags('exercises')
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @Get()
  @ApiOperation({ summary: 'List exercises with pagination, search, and filters' })
  @ApiResponse({ status: 200, description: 'Return a list of exercises' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getExercises(@Query() query: ExerciseQueryDto): Promise<ExerciseResponseDto[]> {
    const exercises = await this.exerciseService.getExercises(query);
    // Map to response DTO (we can use the same shape as ExerciseWithRelations, but we'll use the DTO for consistency)
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

  @Get(':id')
  @ApiOperation({ summary: 'Get exercise details by ID' })
  @ApiResponse({ status: 200, description: 'Return the exercise details' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getExerciseById(@Param('id') id: string): Promise<ExerciseResponseDto> {
    const exercise = await this.exerciseService.getExerciseById(id);
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${id} not found`);
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

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new custom exercise' })
  @ApiResponse({ status: 201, description: 'Exercise created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createExercise(
    @Body() createExerciseDto: CreateExerciseDto,
    @Req() req: Request,
  ): Promise<ExerciseResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update an existing custom exercise' })
  @ApiResponse({ status: 200, description: 'Exercise updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateExercise(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
    @Req() req: Request,
  ): Promise<ExerciseResponseDto> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a custom exercise' })
  @ApiResponse({ status: 200, description: 'Exercise deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async deleteExercise(@Param('id') id: string, @Req() req: Request): Promise<{ message: string }> {
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    await this.exerciseService.deleteExercise(id, userId);
    return { message: 'Exercise deleted successfully' };
  }
}
