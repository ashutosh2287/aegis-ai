import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Request,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { WorkoutExercisesService } from './workout-exercises.service';
import { AddExerciseToWorkoutDto } from './dto/add-exercise-to-workout.dto';
import { UpdateWorkoutExerciseDto } from './dto/update-workout-exercise.dto';
import { ReorderWorkoutExercisesDto } from './dto/reorder-workout-exercises.dto';
import { WorkoutExerciseWithExercise } from './interfaces/workout-exercise.interface';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('workouts/:id/exercises')
@ApiTags('workout-exercises')
export class WorkoutExercisesController {
  constructor(private readonly workoutExercisesService: WorkoutExercisesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add an exercise to a workout' })
  @ApiResponse({ status: 201, description: 'Exercise added to workout successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout or exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async addExerciseToWorkout(
    @Param('id') workoutId: string,
    @Body() dto: AddExerciseToWorkoutDto,
    @Req() req: Request,
  ): Promise<WorkoutExerciseWithExercise> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutExercisesService.addExerciseToWorkout(workoutId, userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all exercises for a workout' })
  @ApiResponse({ status: 200, description: 'Return a list of workout exercises' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async getWorkoutExercises(
    @Param('id') workoutId: string,
    @Req() req: Request,
  ): Promise<WorkoutExerciseWithExercise[]> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    return this.workoutExercisesService.getWorkoutExercises(workoutId, userId);
  }

  @Patch(':workoutExerciseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a workout exercise' })
  @ApiResponse({ status: 200, description: 'Workout exercise updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout or workout exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async updateWorkoutExercise(
    @Param('id') workoutId: string,
    @Param('workoutExerciseId') workoutExerciseId: string,
    @Body() dto: UpdateWorkoutExerciseDto,
    @Req() req: Request,
  ): Promise<WorkoutExerciseWithExercise> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    const workoutExercise = await this.workoutExercisesService.updateWorkoutExercise(
      workoutId,
      userId,
      workoutExerciseId,
      dto,
    );
    // We need to return the workout exercise with exercise details.
    // The service's updateWorkoutExercise returns a WorkoutExercise (without exercise details).
    // We'll fetch the exercise details and combine.
    const exercise = await this.workoutExercisesService['exerciseService'].getExerciseById(workoutExercise.exerciseId);
    if (!exercise) {
      throw new NotFoundException(`Exercise with ID ${workoutExercise.exerciseId} not found`);
    }
    return {
      ...workoutExercise,
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

  @Delete(':workoutExerciseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a workout exercise' })
  @ApiResponse({ status: 200, description: 'Workout exercise deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout or workout exercise not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async deleteWorkoutExercise(
    @Param('id') workoutId: string,
    @Param('workoutExerciseId') workoutExerciseId: string,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    await this.workoutExercisesService.deleteWorkoutExercise(workoutId, userId, workoutExerciseId);
    return { message: 'Workout exercise deleted successfully' };
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Reorder workout exercises' })
  @ApiResponse({ status: 200, description: 'Workout exercises reordered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Workout not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBearerAuth()
  async reorderWorkoutExercises(
    @Param('id') workoutId: string,
    @Body() dto: ReorderWorkoutExercisesDto,
    @Req() req: Request,
  ): Promise<{ message: string }> {
    const user = (req as any).user;
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const userId = user.id;
    await this.workoutExercisesService.reorderWorkoutExercises(workoutId, userId, dto);
    return { message: 'Workout exercises reordered successfully' };
  }
}